import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  '/': 'Accueil',
  '/rack': 'Plan des Chambres',
  '/reservations': 'Réservations',
  '/reservations/new': 'Nouvelle Réservation',
  '/reservations/advanced': 'Réservations Avancées',
  '/guests': 'Mes Clients',
  '/arrivals': 'Arrivées du Jour',
  '/billing': 'Facturation',
  '/housekeeping': 'Ménage',
  '/maintenance': 'Maintenance',
  '/pos': 'Point de Vente',
  '/restaurant': 'Restaurant',
  '/pos/orders': 'Commandes',
  '/pos/menu': 'Menu',
  '/reports': 'Rapports',
  '/analytics': 'Analytics',
  '/settings': 'Paramètres',
  '/settings/tariffs': 'Tarifs',
  '/settings/users': 'Utilisateurs',
};

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always include home
    if (location.pathname !== '/') {
      breadcrumbs.push({ label: 'Accueil', path: '/' });
    }
    
    // Build path progressively
    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  
  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for home page or single-level pages
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <React.Fragment key={item.path}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            
            {isLast ? (
              <span className="font-medium text-foreground">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-foreground transition-colors"
              >
                {index === 0 && item.path === '/' ? (
                  <Home className="h-4 w-4" />
                ) : (
                  item.label
                )}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}