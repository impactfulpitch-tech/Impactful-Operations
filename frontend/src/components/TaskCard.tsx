import { Task } from "@/data/mockData";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { Calendar, Link2, MessageSquare, AlertTriangle } from "lucide-react";

export default function TaskCard({ task }: { task: Task }) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";
  const hasDeps = task.dependencies.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-all duration-200 group animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-mono mb-1">{task.id}</p>
          <h4 className="text-sm font-semibold text-card-foreground truncate">{task.title}</h4>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

      {task.blockedReason && (
        <div className="flex items-start gap-1.5 text-xs text-status-blocked bg-status-blocked/10 rounded-md px-2 py-1.5 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{task.blockedReason}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <StatusBadge status={task.status} />
        <div className="flex items-center gap-3 text-muted-foreground">
          {hasDeps && <Link2 className="w-3.5 h-3.5" />}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              {task.comments.length}
            </span>
          )}
          <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-status-blocked font-medium" : ""}`}>
            <Calendar className="w-3.5 h-3.5" />
            {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
          {task.assignee.avatar}
        </div>
        <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {task.project}
        </span>
      </div>
    </div>
  );
}
