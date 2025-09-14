import { Link, LinkProps } from 'react-router-dom';
import { useRoutePreload } from '@/hooks/useRoutePreload';
import { routePreloaders } from '@/hooks/useRoutePreload';

interface NavigationLinkProps extends LinkProps {
  preloadRoute?: keyof typeof routePreloaders;
  children: React.ReactNode;
}

export function NavigationLink({ 
  preloadRoute, 
  children, 
  onMouseEnter, 
  onFocus,
  ...props 
}: NavigationLinkProps) {
  const { preloadRoute: preload } = useRoutePreload();

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (preloadRoute) {
      preload(preloadRoute);
    }
    onMouseEnter?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
    if (preloadRoute) {
      preload(preloadRoute);
    }
    onFocus?.(e);
  };

  return (
    <Link 
      {...props}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
    >
      {children}
    </Link>
  );
}