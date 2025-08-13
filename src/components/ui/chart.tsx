// Minimal chart component placeholder to avoid build errors
import React from 'react';

// Minimal placeholder types and components
export interface ChartConfig {}

export const ChartContainer = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

export const ChartTooltip = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

export const ChartTooltipContent = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

export const ChartLegend = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

export const ChartLegendContent = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};