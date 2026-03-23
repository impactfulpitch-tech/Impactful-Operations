import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { tasks } from "@/data/mockData";

export interface TaskReminder {
  taskId: string;
  taskTitle: string;
  daysUntilDue: number;
  dueDate: string;
  isOverdue: boolean;
  priority: string;
}

/**
 * Hook to check for tasks that need reminders (15 days before due date)
 * Shows notification when reminder is due
 */
export function useTaskReminders() {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<TaskReminder[]>([]);
  const [hasShownToday, setHasShownToday] = useState(false);

  useEffect(() => {
    // Check for due reminders
    const checkReminders = () => {
      const today = new Date();
      const todayDate = today.toISOString().split("T")[0];
      const lastShown = localStorage.getItem("lastTaskReminderShown");

      // Only show reminders once per day
      if (lastShown === todayDate && hasShownToday) {
        return;
      }

      const dueReminders: TaskReminder[] = [];

      // Use setTimeout to store tasks locally for real app
      const storedTasks = localStorage.getItem("allTasks");
      const tasksToCheck = storedTasks ? JSON.parse(storedTasks) : tasks;

      tasksToCheck.forEach((task: any) => {
        const dueDate = new Date(task.dueDate);
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Trigger reminder at 15 days before due date
        if (daysUntilDue === 15) {
          dueReminders.push({
            taskId: task.id,
            taskTitle: task.title,
            daysUntilDue,
            dueDate: task.dueDate,
            isOverdue: false,
            priority: task.priority || "medium",
          });
        }

        // Also check for overdue tasks
        if (daysUntilDue < 0) {
          dueReminders.push({
            taskId: task.id,
            taskTitle: task.title,
            daysUntilDue,
            dueDate: task.dueDate,
            isOverdue: true,
            priority: task.priority || "medium",
          });
        }
      });

      if (dueReminders.length > 0) {
        setReminders(dueReminders);

        // Show toast notification for each reminder
        dueReminders.forEach((reminder) => {
          const message = reminder.isOverdue
            ? `Task "${reminder.taskTitle}" is overdue by ${Math.abs(reminder.daysUntilDue)} days!`
            : `Task "${reminder.taskTitle}" is due in 15 days (${reminder.dueDate}). Time to plan ahead!`;

          toast({
            title: reminder.isOverdue ? "⚠️ Overdue Task" : "📅 Task Reminder",
            description: message,
            duration: 8000,
            className: reminder.isOverdue
              ? "bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500"
              : reminder.priority === "urgent" || reminder.priority === "high"
              ? "bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500"
              : "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500",
          });
        });

        // Mark reminders as shown today
        localStorage.setItem("lastTaskReminderShown", todayDate);
        setHasShownToday(true);
      }
    };

    // Check on mount
    checkReminders();

    // Check every minute for new reminders
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [toast, hasShownToday]);

  return {
    reminders,
    count: reminders.length,
    hasOverdue: reminders.some((r) => r.isOverdue),
  };
}
