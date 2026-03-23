import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { projectList } from "@/data/mockData";

export interface ProjectReminder {
  projectId: string;
  projectName: string;
  daysUntilEnd: number;
  endDate: string;
  isOverdue: boolean;
}

/**
 * Hook to check for projects that need reminders (15 days before end date)
 * Shows notification when reminder is due
 */
export function useProjectReminders() {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<ProjectReminder[]>([]);
  const [hasShownToday, setHasShownToday] = useState(false);

  useEffect(() => {
    // Check for due reminders
    const checkReminders = () => {
      const today = new Date();
      const todayDate = today.toISOString().split("T")[0];
      const lastShown = localStorage.getItem("lastProjectReminderShown");

      // Only show reminders once per day
      if (lastShown === todayDate && hasShownToday) {
        return;
      }

      const dueReminders: ProjectReminder[] = [];

      // Check stored projects or use default
      const storedProjects = localStorage.getItem("allProjects");
      const projectsToCheck = storedProjects ? JSON.parse(storedProjects) : projectList;

      projectsToCheck.forEach((project: any) => {
        if (!project.endDate) return;

        const endDate = new Date(project.endDate);
        const daysUntilEnd = Math.floor(
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Trigger reminder at 15 days before end date
        if (daysUntilEnd === 15) {
          dueReminders.push({
            projectId: project.id,
            projectName: project.name,
            daysUntilEnd,
            endDate: project.endDate,
            isOverdue: false,
          });
        }

        // Also check for overdue projects
        if (daysUntilEnd < 0 && project.status !== "completed") {
          dueReminders.push({
            projectId: project.id,
            projectName: project.name,
            daysUntilEnd,
            endDate: project.endDate,
            isOverdue: true,
          });
        }
      });

      if (dueReminders.length > 0) {
        setReminders(dueReminders);

        // Show toast notification for each reminder
        dueReminders.forEach((reminder) => {
          const message = reminder.isOverdue
            ? `Project "${reminder.projectName}" is overdue by ${Math.abs(reminder.daysUntilEnd)} days!`
            : `Project "${reminder.projectName}" ends in 15 days (${reminder.endDate}). Time to plan wrap-up!`;

          toast({
            title: reminder.isOverdue ? "⚠️ Overdue Project" : "📅 Project Reminder",
            description: message,
            duration: 8000,
            className: reminder.isOverdue
              ? "bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500"
              : "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500",
          });
        });

        // Mark reminders as shown today
        localStorage.setItem("lastProjectReminderShown", todayDate);
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
