import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBar } from './StatusBar';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  headerActions?: React.ReactNode;
  className?: string;
  showStatusBar?: boolean;
}

export function PageLayout({
  children,
  title,
  description,
  breadcrumbs = [],
  headerActions,
  className,
  showStatusBar = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-pearl">
      {showStatusBar && <StatusBar />}
      {/* Luxury gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pearl via-background to-platinum/50" />
      
      <div className={cn("relative container mx-auto px-6 py-8", className)}>
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-6">
            <BreadcrumbList className="text-sm text-muted-foreground font-premium">
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <Crown className="h-3 w-3 accent-gold" />
              </BreadcrumbSeparator>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {breadcrumb.href ? (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="accent-gold font-medium">
                        {breadcrumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator>
                      <Crown className="h-3 w-3 accent-gold" />
                    </BreadcrumbSeparator>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-luxury font-bold text-charcoal leading-tight animate-fade-in">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground font-premium text-lg leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex gap-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                {headerActions}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          {children}
        </div>
      </div>
    </div>
  );
}