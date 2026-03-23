import { TaskStatus, TaskPriority, statusConfig, priorityConfig } from "@/data/mockData";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`w-2 h-2 rounded-full ${config.colorClass}`} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`w-1.5 h-3 rounded-sm ${config.colorClass}`} />
      {config.label}
    </span>
  );
}
