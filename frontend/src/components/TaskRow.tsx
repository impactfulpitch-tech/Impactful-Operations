import { Task, statusConfig } from "@/data/mockData";
import { PriorityBadge } from "./StatusBadge";
import { Edit2, Trash2 } from "lucide-react";

interface TaskRowProps {
  task: Task;
  showReason?: boolean;
  showDueDate?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  showActions?: boolean;
}

export function TaskRow({ task, showReason = false, showDueDate = false, onEdit, onDelete, showActions = true }: TaskRowProps) {
  return (
    <div className="bg-card border border-border rounded-lg px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
      <span className={`w-2 h-2 rounded-full shrink-0 ${statusConfig[task.status].colorClass}`} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">{task.id}</span>
          <span className="text-xs sm:text-sm font-medium text-card-foreground truncate">{task.title}</span>
          {showDueDate && (
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">
              {new Date(task.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
        {showReason && task.blockedReason && <p className="text-[10px] sm:text-xs text-status-blocked mt-0.5">{task.blockedReason}</p>}
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <PriorityBadge priority={task.priority} />
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
          {task.assignee.avatar}
        </div>
        {showActions && (onEdit || onDelete) && (
          <div className="flex items-center gap-1 ml-1">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground"
                title="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 hover:bg-status-blocked/10 hover:text-status-blocked rounded-lg transition-colors text-muted-foreground"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
