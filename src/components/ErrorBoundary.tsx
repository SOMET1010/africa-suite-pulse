/**
 * Enhanced Error Boundary - Phase 4.3
 * Comprehensive error handling and recovery for production
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  lastErrorTime: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetTimeout?: number;
  showDebugInfo?: boolean;
}

/**
 * Enhanced Error Boundary with recovery features
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    // Enhanced error logging
    logger.error('React Error Boundary caught error', error, {
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name
      },
      retryCount,
      maxRetries,
      url: window.location.href,
      userAgent: navigator.userAgent.slice(0, 100),
      timestamp: new Date().toISOString()
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('Error in custom error handler', handlerError);
      }
    }

    // Auto-recovery mechanism
    if (retryCount < maxRetries) {
      this.scheduleAutoRecovery();
    }

    // Report to error tracking service
    this.reportError(error, errorInfo);
  }

  scheduleAutoRecovery = () => {
    const { resetTimeout = 10000 } = this.props;
    
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = setTimeout(() => {
      logger.info('Attempting automatic error recovery');
      this.handleRetry();
    }, resetTimeout);
  };

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Report to external error tracking service (e.g., Sentry)
      // This is a placeholder for actual error reporting
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId
      };

      logger.audit('Error reported to tracking service', { errorId: this.state.errorId });
    } catch (reportingError) {
      logger.error('Failed to report error', reportingError);
    }
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      logger.info('Retrying after error', { attempt: retryCount + 1, maxRetries });
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      logger.warn('Max retries exceeded, manual intervention required');
    }
  };

  handleReset = () => {
    logger.info('Manual error boundary reset');
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastErrorTime: 0
    });
  };

  handleReload = () => {
    logger.audit('Page reload triggered by error boundary');
    window.location.reload();
  };

  handleGoHome = () => {
    logger.audit('Navigation to home triggered by error boundary');
    window.location.href = '/';
  };

  renderError = () => {
    const { error, errorInfo, errorId, retryCount } = this.state;
    const { maxRetries = 3, showDebugInfo = process.env.NODE_ENV === 'development' } = this.props;
    
    const canRetry = retryCount < maxRetries;
    const isRecurringError = retryCount > 1;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <CardTitle className="text-xl">
                  {isRecurringError ? 'Erreur Persistante' : 'Erreur Inattendue'}
                </CardTitle>
                <CardDescription>
                  Une erreur est survenue dans l'application
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Summary */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Type d'erreur :</strong> {error?.name || 'Erreur Inconnue'}
                <br />
                <strong>Message :</strong> {error?.message || 'Aucun message disponible'}
                <br />
                <strong>ID d'erreur :</strong> {errorId}
              </AlertDescription>
            </Alert>

            {/* Retry Information */}
            {retryCount > 0 && (
              <Alert>
                <AlertDescription>
                  Tentative {retryCount} sur {maxRetries} effectuée.
                  {canRetry ? ' Une nouvelle tentative automatique va être effectuée.' : 
                   ' Toutes les tentatives automatiques ont échoué.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Debug Information */}
            {showDebugInfo && error && (
              <details className="space-y-2">
                <summary className="cursor-pointer font-medium text-sm">
                  Informations de débogage
                </summary>
                <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap text-xs">
                      {error.stack}
                    </pre>
                  </div>
                  {errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {canRetry && (
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer ({maxRetries - retryCount} restant{maxRetries - retryCount > 1 ? 's' : ''})
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={this.handleReset}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleGoHome}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Button>
            </div>

            {/* Emergency Actions */}
            {!canRetry && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Si le problème persiste, vous pouvez :
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={this.handleReload}
                    size="sm"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recharger la page
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const subject = `Erreur AfricaSuite - ${errorId}`;
                      const body = `ID d'erreur: ${errorId}\nType: ${error?.name}\nMessage: ${error?.message}\nURL: ${window.location.href}`;
                      window.open(`mailto:support@africasuite.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contacter le support
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || this.renderError();
    }

    return children;
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook for error boundary integration
 */
export function useErrorHandler() {
  const throwError = (error: Error) => {
    // This will be caught by the nearest error boundary
    throw error;
  };

  const handleAsyncError = (errorPromise: Promise<any>) => {
    errorPromise.catch(error => {
      logger.error('Async error caught by error handler', error);
      throwError(error);
    });
  };

  return { throwError, handleAsyncError };
}