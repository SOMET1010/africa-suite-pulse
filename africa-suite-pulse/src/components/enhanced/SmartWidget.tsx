import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/core/utils/cn";
import { HotelCard } from "./HotelCard";
import { StatusIndicator } from "./StatusIndicator";
import { TouchButton } from "./TouchButton";
import { LoadingState } from "./LoadingState";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  MoreHorizontal
} from "lucide-react";

const smartWidgetVariants = cva(
  "smart-widget transition-all duration-300",
  {
    variants: {
      type: {
        stats: "stats-widget",
        alerts: "alerts-widget", 
        actions: "actions-widget",
        timeline: "timeline-widget",
        chart: "chart-widget",
      },
      priority: {
        urgent: "border-destructive/30 bg-destructive/5",
        high: "border-warning/30 bg-warning/5",
        normal: "border-border bg-card",
        low: "border-muted bg-muted/20",
      },
      refreshState: {
        idle: "",
        loading: "opacity-75",
        error: "border-destructive/50",
        success: "border-success/50",
      },
    },
    defaultVariants: {
      type: "stats",
      priority: "normal", 
      refreshState: "idle",
    },
  }
);

interface WidgetAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "primary" | "destructive";
}

interface StatData {
  value: string | number;
  label: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
    isPositive?: boolean;
  };
  comparison?: string;
}

interface AlertData {
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp?: Date;
  source?: string;
}

interface ActionData {
  title: string;
  description?: string;
  count?: number;
  dueTime?: Date;
}

interface SmartWidgetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof smartWidgetVariants> {
  title: string;
  subtitle?: string;
  data: StatData | AlertData | ActionData | any;
  actions?: WidgetAction[];
  refreshInterval?: number;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  error?: string;
  lastUpdated?: Date;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SmartWidget = React.forwardRef<HTMLDivElement, SmartWidgetProps>(
  ({ 
    className,
    type,
    priority,
    refreshState,
    title,
    subtitle,
    data,
    actions,
    refreshInterval,
    onRefresh,
    isLoading,
    error,
    lastUpdated,
    size = 'md',
    ...props 
  }, ref) => {
    const [loading, setLoading] = React.useState(false);
    const [lastRefresh, setLastRefresh] = React.useState<Date | undefined>(lastUpdated);

    const handleRefresh = React.useCallback(async () => {
      if (!onRefresh || loading) return;
      
      setLoading(true);
      try {
        await onRefresh();
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Widget refresh failed:', err);
      } finally {
        setLoading(false);
      }
    }, [onRefresh, loading]);

    // Auto-refresh effect
    React.useEffect(() => {
      if (!refreshInterval || !onRefresh) return;
      
      const interval = setInterval(handleRefresh, refreshInterval);
      return () => clearInterval(interval);
    }, [refreshInterval, handleRefresh, onRefresh]);

    const renderContent = () => {
      if (isLoading || loading) {
        return (
          <div className="flex items-center justify-center p-6">
            <LoadingState text="Mise à jour..." size="sm" />
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        );
      }

      switch (type) {
        case 'stats':
          return renderStatsContent(data as StatData);
        case 'alerts':
          return renderAlertsContent(data as AlertData);
        case 'actions':
          return renderActionsContent(data as ActionData);
        case 'timeline':
          return renderTimelineContent(data);
        default:
          return <div className="p-4 text-muted-foreground text-sm">Type de widget non supporté</div>;
      }
    };

    const renderStatsContent = (stats: StatData) => (
      <div className="space-y-4">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">{stats.value}</span>
          {stats.trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm",
              stats.trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {stats.trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : stats.trend.direction === 'down' ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span>{stats.trend.value}</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{stats.label}</p>
          {stats.comparison && (
            <p className="text-xs text-muted-foreground">{stats.comparison}</p>
          )}
        </div>
      </div>
    );

    const renderAlertsContent = (alert: AlertData) => (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <StatusIndicator 
            status={alert.level === 'error' ? 'error' : alert.level === 'warning' ? 'warning' : 'active'}
            size="sm"
          />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-foreground">{alert.message}</p>
            {alert.source && (
              <p className="text-xs text-muted-foreground">Source: {alert.source}</p>
            )}
            {alert.timestamp && (
              <p className="text-xs text-muted-foreground">
                {alert.timestamp.toLocaleString('fr-FR')}
              </p>
            )}
          </div>
        </div>
      </div>
    );

    const renderActionsContent = (action: ActionData) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{action.title}</p>
            {action.count && (
              <span className="text-lg font-bold text-primary">{action.count}</span>
            )}
          </div>
          {action.description && (
            <p className="text-xs text-muted-foreground">{action.description}</p>
          )}
          {action.dueTime && (
            <div className="flex items-center gap-1 text-xs text-warning">
              <Clock className="h-3 w-3" />
              <span>À faire avant {action.dueTime.toLocaleTimeString('fr-FR')}</span>
            </div>
          )}
        </div>
      </div>
    );

    const renderTimelineContent = (timeline: any) => (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Timeline widget - À implémenter</p>
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(smartWidgetVariants({ type, priority, refreshState }), "rounded-lg border p-4", className)}
        {...props}
      >
        <div className="space-y-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="space-y-4">
          {/* Widget Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lastRefresh && (
                <span className="text-xs text-muted-foreground">
                  Mis à jour: {lastRefresh.toLocaleTimeString('fr-FR')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {onRefresh && (
                <TouchButton
                  intent="secondary"
                  touchSize="compact"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                </TouchButton>
              )}
              <TouchButton
                intent="secondary"
                touchSize="compact"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-3 w-3" />
              </TouchButton>
            </div>
          </div>

          {/* Widget Content */}
          {renderContent()}

          {/* Widget Actions */}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {actions.map((action, index) => (
                <TouchButton
                  key={index}
                  intent={action.variant === 'destructive' ? 'danger' : action.variant === 'primary' ? 'primary' : 'secondary'}
                  touchSize="compact"
                  feedback="haptic"
                  onClick={action.onClick}
                >
                  {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                  {action.label}
                </TouchButton>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SmartWidget.displayName = "SmartWidget";