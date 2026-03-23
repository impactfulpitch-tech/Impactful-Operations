interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  alert?: boolean;
  success?: boolean;
  color?: "default" | "primary" | "status-done" | "status-blocked" | "status-review";
  change?: number;
  trend?: "up" | "down";
}

interface StatGridProps {
  stats: Array<Stat>;
  columns?: 2 | 3 | 4;
  isAdmin?: boolean;
  onAddStat?: () => void;
  onEditStat?: (index: number) => void;
  onDeleteStat?: (index: number) => void;
}

const COLUMN_CLASSES = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

const COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
  "status-done": { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-500" },
  "status-blocked": { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400", icon: "text-red-600 dark:text-red-500" },
  "status-review": { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", icon: "text-amber-600 dark:text-amber-500" },
  "primary": { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", icon: "text-blue-600 dark:text-blue-500" },
};

function getColorClasses(stat: Stat) {
  if (stat.color && stat.color in COLOR_MAP) {
    return COLOR_MAP[stat.color];
  }
  if (stat.alert) return COLOR_MAP["status-blocked"];
  if (stat.success) return COLOR_MAP["status-done"];
  return { bg:  "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-900/20", text: "text-slate-700 dark:text-slate-300", icon: "text-slate-600 dark:text-slate-400" };
}

export function StatGrid({ stats, columns = 4, isAdmin = false, onAddStat, onEditStat, onDeleteStat }: StatGridProps) {
  const colClass = COLUMN_CLASSES[columns];

  return (
    <div className={`grid gap-3 sm:gap-4 lg:gap-5 ${colClass}`}>
      {stats.map((stat, idx) => {
        const colors = getColorClasses(stat);
        return (
          <div
            key={idx}
            className={`${colors.bg} relative group rounded-xl border border-white/40 dark:border-white/10 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 overflow-hidden`}
          >
            {/* Background gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />

            <div className="relative px-4 sm:px-5 py-5 sm:py-6 h-full flex flex-col justify-between">
              {/* Header with icon and actions */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`${colors.icon} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                  {stat.icon}
                </div>
                
                {isAdmin && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={() => onEditStat?.(idx)}
                      className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                      title="Edit"
                      aria-label="Edit stat"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDeleteStat?.(idx)}
                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                      title="Delete"
                      aria-label="Delete stat"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Value and label */}
              <div className="space-y-1.5">
                <p className={`${colors.text} text-2xl sm:text-3xl lg:text-4xl font-bold transition-colors duration-300`}>
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
              </div>

              {/* Trend indicator */}
              {stat.change !== undefined && (
                <div className="mt-3 flex items-center gap-1">
                  <span className={`text-xs sm:text-sm font-semibold ${
                    stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {stat.trend === "up" ? "↑" : "↓"} {Math.abs(stat.change)}%
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">from last month</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isAdmin && (
        <button
          onClick={onAddStat}
          className="group relative rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/30 px-4 sm:px-5 py-5 sm:py-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all duration-300 cursor-pointer hover:shadow-md"
          aria-label="Add new stat"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300 shadow-sm">
            +
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Add Stat</span>
          <span className="text-xs text-slate-500 dark:text-slate-500">Click to add a new metric</span>
        </button>
      )}
    </div>
  );
}
