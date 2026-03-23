import { Task } from "@/data/mockData";
import { Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskDetailsProps {
  task: Task;
  compact?: boolean;
}

export function TaskDetails({ task, compact = false }: TaskDetailsProps) {
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  const startDate = new Date(task.startDate);
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const isOverdue = daysUntilDue < 0;
  const isNearDeadline = daysUntilDue <= 15 && daysUntilDue > 0;
  const isCompleted = task.status === "done";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (compact) {
    return (
      <div className="text-xs space-y-1">
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(task.startDate)} → {formatDate(task.dueDate)}</span>
        </div>
        {task.timeline && (
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{task.timeline}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Timeline Section */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Timeline</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Start Date:</span>
            <span className="font-medium text-slate-900 dark:text-white">{formatDate(task.startDate)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Due Date:</span>
            <span className={`font-medium ${isOverdue ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
              {formatDate(task.dueDate)}
            </span>
          </div>
          {task.timeline && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Duration:</span>
              <span className="font-medium text-slate-900 dark:text-white">{task.timeline}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Progress</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Days Running:</span>
            <span className="font-medium text-slate-900 dark:text-white">{daysSinceStart} days</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Days Remaining:</span>
            <span className={`font-medium flex items-center gap-1 ${
              isOverdue ? "text-red-600 dark:text-red-400" 
              : isNearDeadline ? "text-orange-600 dark:text-orange-400"
              : "text-green-600 dark:text-green-400"
            }`}>
              {isOverdue ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  {Math.abs(daysUntilDue)} days overdue
                </>
              ) : isNearDeadline ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  {daysUntilDue} days left
                </>
              ) : isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  {daysUntilDue} days left
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Reminder Section */}
      {task.reminderDate && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Reminder</h4>
          <div className="flex items-center gap-2 p-2 bgslate-100 dark:bg-slate-800 rounded text-sm">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              Reminder scheduled for {formatDate(task.reminderDate)} (15 days before due date)
            </span>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Status:</span>
        <Badge variant={task.status === "done" ? "secondary" : "default"}>
          {task.status.replace("-", " ").toUpperCase()}
        </Badge>
      </div>
    </div>
  );
}
