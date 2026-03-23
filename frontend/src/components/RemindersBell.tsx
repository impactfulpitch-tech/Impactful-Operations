import { Bell, AlertCircle, Calendar, X } from "lucide-react";
import { useProjectReminders } from "@/hooks/useProjectReminders";
import { useState, useEffect } from "react";

/**
 * Project Reminders Notification Bell
 * Shows in top right of app, displays number of pending reminders
 * Auto-opens if there are overdue reminders
 */
export function RemindersBell() {
  const { reminders, count, hasOverdue } = useProjectReminders();
  const [showPanel, setShowPanel] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState<string[]>([]);

  // Auto-open panel if there are overdue reminders
  useEffect(() => {
    if (hasOverdue) {
      setShowPanel(true);
    }
  }, [hasOverdue]);

  const toggleReminder = (projectId: string) => {
    setExpandedReminders((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <div className="relative">
      {/* Reminder Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`relative p-2 sm:p-2.5 rounded-lg transition-all duration-200 ${
          showPanel
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        }`}
        title="Project Reminders"
      >
        <Bell className={`w-5 h-5 ${hasOverdue ? "animate-bounce" : ""}`} />
        {count > 0 && (
          <span
            className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full text-white ${
              hasOverdue
                ? "bg-red-500 animate-pulse"
                : "bg-blue-500"
            }`}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Reminders Panel */}
      {showPanel && count > 0 && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Project Reminders
              </h3>
              {hasOverdue && (
                <span className="ml-auto text-xs px-2 py-1 bg-red-500 text-white rounded-full font-bold">
                  ⚠️ Overdue
                </span>
              )}
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Reminders List */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {reminders.map((reminder) => (
              <div
                key={reminder.projectId}
                className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border-l-4 ${
                  reminder.isOverdue || reminder.daysSinceStart >= 30
                    ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
                    : "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                }`}
              >
                <div
                  onClick={() => toggleReminder(reminder.projectId)}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {(reminder.isOverdue || reminder.daysSinceStart >= 30) && (
                        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                      )}
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                        {reminder.projectName}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {reminder.daysSinceStart} days since project start
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 ${
                      reminder.isOverdue || reminder.daysSinceStart >= 30
                        ? "bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200"
                        : "bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                    }`}
                  >
                    {reminder.daysSinceStart >= 30 ? "Overdue" : "Review"}
                  </span>
                </div>

                {/* Expanded Details */}
                {expandedReminders.includes(reminder.projectId) && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Status:</strong> Please review project progress and status
                    </p>
                    <p>
                      <strong>Action:</strong> Check milestones, budget, and team status
                    </p>
                    <button className="mt-2 w-full px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors">
                      View Project
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="sticky bottom-0 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
            {count} reminder{count !== 1 ? "s" : ""} pending
          </div>
        </div>
      )}

      {/* Empty State */}
      {showPanel && count === 0 && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 p-4 text-center">
          <Bell className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No reminders at this time
          </p>
          <button
            onClick={() => setShowPanel(false)}
            className="mt-3 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
