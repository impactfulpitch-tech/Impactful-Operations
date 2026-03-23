import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
}

export default function StatsCard({ title, value, subtitle, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-card-foreground">{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-[11px] font-semibold mt-1 ${trend.positive ? "text-status-done" : "text-status-blocked"}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
