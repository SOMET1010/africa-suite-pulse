import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartSkeletonProps {
  title?: string;
  description?: string;
  height?: string;
  showLegend?: boolean;
}

export function ChartSkeleton({ 
  title = "Chargement du graphique...", 
  description,
  height = "h-80",
  showLegend = false 
}: ChartSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="animate-pulse bg-muted/50 h-6 w-48 rounded"></CardTitle>
        {description && (
          <CardDescription className="animate-pulse bg-muted/30 h-4 w-64 rounded mt-2"></CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className={`${height} bg-muted/20 rounded-lg animate-pulse flex items-center justify-center`}>
          <div className="text-muted-foreground text-sm">{title}</div>
        </div>
        {showLegend && (
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted/50 animate-pulse"></div>
                <div className="flex-1 h-4 bg-muted/30 rounded animate-pulse"></div>
                <div className="w-8 h-4 bg-muted/40 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}