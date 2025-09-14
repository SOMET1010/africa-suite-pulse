import React from "react";
import { cn } from "@/core/utils/cn";

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "skip-link",
        "absolute -top-40 left-6 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md transition-all",
        "focus:top-6",
        className
      )}
    >
      {children}
    </a>
  );
}

interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article" | "aside" | "header" | "footer" | "main";
  children: React.ReactNode;
  className?: string;
  focusable?: boolean;
}

export function AccessibleCard({ 
  as: Component = "div", 
  children, 
  className, 
  focusable = false,
  ...props 
}: AccessibleCardProps) {
  const componentProps = {
    className: cn(
      "card-elevated",
      focusable && "focus-interactive cursor-pointer",
      className
    ),
    tabIndex: focusable ? 0 : undefined,
    role: focusable ? "button" : undefined,
    ...props
  };

  return React.createElement(Component, componentProps, children);
}

interface ScreenReaderTextProps {
  children: React.ReactNode;
}

export function ScreenReaderText({ children }: ScreenReaderTextProps) {
  return <span className="sr-only">{children}</span>;
}

interface LiveRegionProps {
  children: React.ReactNode;
  level?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: "additions" | "removals" | "text" | "all";
}

export function LiveRegion({ 
  children, 
  level = "polite", 
  atomic = true, 
  relevant = "all" 
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={level}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
}

interface AnnouncementProps {
  message: string;
  level?: "polite" | "assertive";
}

export function Announcement({ message, level = "polite" }: AnnouncementProps) {
  const [announcement, setAnnouncement] = React.useState(message);

  React.useEffect(() => {
    setAnnouncement(message);
  }, [message]);

  return (
    <LiveRegion level={level}>
      {announcement}
    </LiveRegion>
  );
}