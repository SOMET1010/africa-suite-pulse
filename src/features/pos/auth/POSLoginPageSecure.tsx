import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePOSAuthSecure } from './usePOSAuthSecure';
import { Shield, Lock, User, Clock, AlertTriangle, CheckCircle2, LogOut, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Interface tactile optimisée avec design moderne
const TactileKeypad = ({ onKeyPress, onClear, onBackspace, disabled }: {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'], 
    ['7', '8', '9'],
    ['clear', '0', 'backspace']
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {keys.flat().map((key) => {
        if (key === 'clear') {
          return (
            <Button
              key={key}
              variant="outline"
              size="lg"
              onClick={onClear}
              disabled={disabled}
              className="h-16 text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              CLR
            </Button>
          );
        }
        
        if (key === 'backspace') {
          return (
            <Button
              key={key}
              variant="outline"
              size="lg"
              onClick={onBackspace}
              disabled={disabled}
              className="h-16 hover:bg-muted transition-colors"
            >
              ⌫
            </Button>
          );
        }
        
        return (
          <Button
            key={key}
            variant="outline"
            size="lg"
            onClick={() => onKeyPress(key)}
            disabled={disabled}
            className="h-16 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {key}
          </Button>
        );
      })}
    </div>
  );
};

// Composant pour afficher le PIN avec masquage/démasquage
const SecurePinDisplay = ({ pin, showPin }: { pin: string; showPin: boolean }) => {
  const displayValue = showPin ? pin : '•'.repeat(pin.length);
  
  return (
    <div className="flex items-center justify-center min-h-[60px] bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20 px-4">
      <span className="text-2xl font-mono tracking-wider text-foreground">
        {displayValue || 'Entrez votre PIN'}
      </span>
    </div>
  );
};

// Interface principale de connexion POS sécurisée
export default function POSLoginPageSecure() {
  const navigate = useNavigate();
  const { session, loading, error, authenticate, logout, isAuthenticated } = usePOSAuthSecure();
  
  const [employeeCode, setEmployeeCode] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lockoutInfo, setLockoutInfo] = useState<{ lockedUntil?: Date } | null>(null);

  // Auto-navigation si déjà authentifié
  useEffect(() => {
    if (isAuthenticated && session) {
      navigate('/pos');
    }
  }, [isAuthenticated, session, navigate]);

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setAuthError(null);
    setLockoutInfo(null);
  };

  const handleLogin = async () => {
    if (!employeeCode.trim()) {
      setAuthError('Veuillez entrer votre code employé');
      return;
    }
    
    if (pin.length < 4) {
      setAuthError('Le PIN doit contenir au moins 4 chiffres');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    // Simulation d'un org_id pour les tests - à remplacer par la vraie logique
    const orgId = 'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f';

    const result = await authenticate(employeeCode, pin, orgId);
    
    if (!result.success) {
      setAuthError(result.error || 'Erreur d\'authentification');
      if (result.lockedUntil) {
        setLockoutInfo({ lockedUntil: result.lockedUntil });
      }
      setPin('');
    }
    
    setIsAuthenticating(false);
  };

  const handleLogout = async () => {
    await logout();
    setEmployeeCode('');
    setPin('');
    setAuthError(null);
    setLockoutInfo(null);
  };

  const handleContinue = () => {
    navigate('/pos');
  };

  // Interface si déjà connecté
  if (isAuthenticated && session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Session Active</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold text-lg">{session.display_name}</span>
              </div>
              
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {session.employee_code} - {session.role_name.replace('pos_', '').toUpperCase()}
              </Badge>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Session expire le {new Date(session.expires_at).toLocaleString('fr-FR')}</span>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleContinue} 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continuer vers le POS
              </Button>
              
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Changer d'utilisateur
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface de connexion principale
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Connexion POS Sécurisée</CardTitle>
          <p className="text-muted-foreground">Entrez vos identifiants pour accéder au système</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Code Employé */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Code Employé</span>
            </label>
            <Input
              type="text"
              placeholder="Votre code employé"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
              disabled={loading || isAuthenticating}
              className="text-center text-lg font-mono"
              maxLength={10}
            />
          </div>

          {/* PIN Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Code PIN</span>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPin(!showPin)}
                className="h-8 px-2"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <SecurePinDisplay pin={pin} showPin={showPin} />
          </div>

          {/* Clavier tactile */}
          <div className="space-y-4">
            <TactileKeypad
              onKeyPress={handlePinInput}
              onClear={handleClear}
              onBackspace={handleBackspace}
              disabled={loading || isAuthenticating}
            />
          </div>

          {/* Messages d'erreur et d'alerte */}
          {authError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {lockoutInfo?.lockedUntil && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Compte verrouillé jusqu'à {lockoutInfo.lockedUntil.toLocaleTimeString('fr-FR')}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Bouton de connexion */}
          <Button
            onClick={handleLogin}
            disabled={!employeeCode.trim() || pin.length < 4 || loading || isAuthenticating}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isAuthenticating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Authentification...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Se connecter
              </>
            )}
          </Button>

          {/* Informations de sécurité */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>🔒 Connexion sécurisée avec chiffrement</p>
            <p>⏰ Session expire automatiquement après 8h d'inactivité</p>
            <p>🛡️ 5 tentatives maximum avant verrouillage temporaire</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}