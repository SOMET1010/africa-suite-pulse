import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/core/utils/cn";
import { HotelCard } from "./HotelCard";
import { TouchButton } from "./TouchButton";
import { StatusIndicator } from "./StatusIndicator";

const dashboardLayoutVariants = cva(
  "dashboard-layout min-h-screen bg-gradient-to-br from-background to-muted/20",
  {
    variants: {
      density: {
        compact: "dashboard-gap-compact",
        comfortable: "dashboard-gap-comfortable", 
        spacious: "dashboard-gap-spacious",
      },
      layout: {
        grid: "grid-layout",
        masonry: "masonry-layout",
        timeline: "timeline-layout",
      },
    },
    defaultVariants: {
      density: "comfortable",
      layout: "grid",
    },
  }
);

type UserRole = 'receptionist' | 'housekeeper' | 'manager' | 'director';
type TimeContext = 'morning' | 'afternoon' | 'evening' | 'night';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  urgent?: boolean;
  to: string;
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'stats' | 'alerts' | 'actions' | 'timeline';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  data: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface DashboardLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dashboardLayoutVariants> {
  userRole: UserRole;
  timeContext: TimeContext;
  quickActions: QuickAction[];
  widgets: DashboardWidget[];
  greeting?: string;
  hotelName?: string;
}

const roleLabels = {
  receptionist: "Réceptionniste",
  housekeeper: "Gouvernante", 
  manager: "Manager",
  director: "Directeur"
};

const timeLabels = {
  morning: "Matinée",
  afternoon: "Après-midi", 
  evening: "Soirée",
  night: "Nuit"
};

export const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ 
    className,
    density,
    layout,
    userRole,
    timeContext,
    quickActions,
    widgets,
    greeting,
    hotelName = "AfricaSuite",
    children,
    ...props 
  }, ref) => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    const getGreeting = () => {
      if (greeting) return greeting;
      if (currentHour < 12) return "Bonjour";
      if (currentHour < 18) return "Bon après-midi";
      return "Bonsoir";
    };

    const getTimeBasedActions = () => {
      return quickActions.filter(action => {
        // Filter actions based on time context and role
        if (timeContext === 'morning') {
          return ['departures', 'arrivals', 'housekeeping'].includes(action.id);
        } else if (timeContext === 'afternoon') {
          return ['arrivals', 'reservations', 'services'].includes(action.id);
        } else {
          return ['billing', 'reports', 'night-audit'].includes(action.id);
        }
      });
    };

    const urgentWidgets = widgets.filter(w => w.priority === 'urgent');
    const normalWidgets = widgets.filter(w => w.priority !== 'urgent');
    const timeActions = getTimeBasedActions();

    return (
      <div
        ref={ref}
        className={cn(dashboardLayoutVariants({ density, layout }), className)}
        {...props}
      >
        {/* Dashboard Header */}
        <div className="container-app p-6 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {getGreeting()}, {roleLabels[userRole]}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{hotelName} • {timeLabels[timeContext]}</span>
                <StatusIndicator 
                  status="active" 
                  variant="pill" 
                  size="sm"
                  label="En service"
                />
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <TouchButton
                intent="secondary"
                touchSize="compact"
              >
                Paramètres
              </TouchButton>
            </div>
          </div>
        </div>

        {/* Urgent Alerts Section */}
        {urgentWidgets.length > 0 && (
          <div className="container-app px-6 pb-4">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                Actions urgentes ({urgentWidgets.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {urgentWidgets.map((widget) => (
                  <HotelCard
                    key={widget.id}
                    title={widget.title}
                    variant="urgent"
                    size="sm"
                    className="border-destructive/30 bg-destructive/5"
                  >
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {widget.data.description}
                      </p>
                      <TouchButton
                        intent="primary"
                        touchSize="compact"
                        feedback="haptic"
                        className="w-full"
                      >
                        {widget.data.action || "Traiter maintenant"}
                      </TouchButton>
                    </div>
                  </HotelCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Time-Based Actions */}
        {timeActions.length > 0 && (
          <div className="container-app px-6 pb-4">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Actions de {timeLabels[timeContext].toLowerCase()}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeActions.map((action) => (
                  <HotelCard
                    key={action.id}
                    title={action.label}
                    variant={action.urgent ? "urgent" : "default"}
                    size="sm"
                    
                  >
                    <TouchButton
                      intent="primary"
                      touchSize="comfortable"
                      feedback="haptic"
                      className="w-full mt-2"
                    >
                      Accéder
                    </TouchButton>
                  </HotelCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="container-app px-6 pb-6">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">
              Tableau de bord
            </h2>
            
            <div className="dashboard-responsive-grid gap-6">
              {normalWidgets.map((widget) => (
                <HotelCard
                  key={widget.id}
                  title={widget.title}
                  variant="default"
                  size={widget.size === 'lg' ? 'md' : 'sm'}
                  className={cn(
                    widget.size === 'xl' && "col-span-full",
                    widget.size === 'lg' && "col-span-2"
                  )}
                >
                  <div className="widget-content">
                    {/* Widget content would be rendered here based on type */}
                    <p className="text-sm text-muted-foreground">
                      Contenu du widget {widget.type}
                    </p>
                  </div>
                </HotelCard>
              ))}
            </div>
          </div>
        </div>

        {/* Custom children */}
        {children}
      </div>
    );
  }
);

DashboardLayout.displayName = "DashboardLayout";