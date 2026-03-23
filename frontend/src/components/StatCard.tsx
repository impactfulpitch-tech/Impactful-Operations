interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  alert?: boolean;
  success?: boolean;
  color?: "default" | "primary" | "status-done" | "status-blocked" | "status-review";
}

export function StatCard({
  label,
  value,
  icon,
  alert = false,
  success = false,
  color = "default",
}: StatCardProps) {
  const colorClass = {
    default: alert ? "text-status-blocked" : "text-muted-foreground",
    primary: "text-primary",
    "status-done": "text-status-done",
    "status-blocked": "text-status-blocked",
    "status-review": "text-status-review",
  }[color];

  const valueColorClass = success
    ? "text-status-done"
    : alert
      ? "text-status-blocked"
      : color === "default"
        ? "text-card-foreground"
        : colorClass;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className={colorClass}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${valueColorClass}`}>{value}</p>
    </div>
  );
}
