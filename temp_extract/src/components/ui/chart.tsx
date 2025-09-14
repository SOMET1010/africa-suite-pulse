import React from 'react';
import { cn } from "@/lib/utils";

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
    icon?: React.ComponentType;
  };
}

interface ChartContainerProps {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ config, children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("chart-container", className)}
      {...props}
      style={{
        ...Object.entries(config).reduce((acc, [key, value]) => {
          acc[`--color-${key}` as keyof typeof acc] = value.color;
          return acc;
        }, {} as Record<string, string>),
      }}
    >
      {children}
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

interface ChartTooltipProps {
  content?: React.ComponentType<Record<string, unknown>>;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export const ChartTooltip = ({ content, children, ...props }: ChartTooltipProps) => {
  // For Recharts compatibility - just pass through the props
  return null; // Recharts handles this internally
};

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{ value: unknown; dataKey: string; color: string; [key: string]: unknown }>;
  label?: string;
  labelFormatter?: (value: unknown) => string;
  formatter?: (value: unknown, name: string) => [string, string];
  className?: string;
}

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ active, payload, label, labelFormatter, formatter, className, ...props }, ref) => {
  if (!active || !payload?.length) {
    return null;
  }

  const formattedLabel = labelFormatter ? labelFormatter(label) : label;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
      {...props}
    >
      {formattedLabel && (
        <div className="mb-2 font-medium text-foreground">
          {formattedLabel}
        </div>
      )}
      <div className="grid gap-1">
        {payload.map((entry, index) => {
          const [formattedValue, formattedName] = formatter 
            ? formatter(entry.value, entry.dataKey)
            : [entry.value, entry.dataKey];
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {formattedName}:
              </span>
               <span className="text-sm font-medium">
                 {String(formattedValue)}
               </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

interface ChartLegendProps {
  content?: React.ComponentType<Record<string, unknown>>;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export const ChartLegend = ({ content: Content, children, ...props }: ChartLegendProps) => {
  if (Content) {
    return <Content {...props} />;
  }
  return <div {...props}>{children}</div>;
};

interface ChartLegendContentProps {
  payload?: Array<{ value: string; color: string; [key: string]: unknown }>;
  className?: string;
}

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(({ payload, className, ...props }, ref) => {
  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", className)}
      {...props}
    >
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";