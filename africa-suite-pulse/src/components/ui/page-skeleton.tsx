interface PageSkeletonProps {
  title?: string;
  showHeader?: boolean;
  showStats?: boolean;
  showContent?: boolean;
}

export function PageSkeleton({ 
  title = "Chargement...", 
  showHeader = true,
  showStats = false,
  showContent = true 
}: PageSkeletonProps) {
  return (
    <div className="min-h-screen bg-pearl content-[auto] contain-intrinsic-size-[1px_800px]">
      {showHeader && (
        <div className="bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-muted/50 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-muted/30 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-muted/40 rounded animate-pulse"></div>
          </div>
        </div>
      )}
      
      {showStats && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-4 w-24 bg-muted/30 rounded animate-pulse mb-3"></div>
                <div className="h-8 w-16 bg-muted/50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showContent && (
        <div className="p-6">
          <div className="bg-white rounded-lg border min-h-[400px] p-6">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-muted/50 rounded animate-pulse"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 bg-muted/30 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">
        {title}
      </div>
    </div>
  );
}