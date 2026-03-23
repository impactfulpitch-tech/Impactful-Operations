interface SectionProps {
  title: string;
  count?: number;
  emptyText?: string;
  children: React.ReactNode;
}

export function Section({ title, count, emptyText = "No items to display", children }: SectionProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const hasContent = childArray.some((child) => child !== null && child !== undefined);

  return (
    <div>
      <div className="mb-3">
        <p className="text-xs sm:text-sm font-semibold text-foreground">
          {title} {count !== undefined && <span className="text-muted-foreground font-normal">({count})</span>}
        </p>
      </div>
      {hasContent ? (
        <div className="space-y-1.5 sm:space-y-2">{children}</div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">{emptyText}</p>
        </div>
      )}
    </div>
  );
}
