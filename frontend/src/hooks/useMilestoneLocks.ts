import { useEffect, useState } from "react";
import { projectList, milestoneLocks, MilestoneLock } from "@/data/mockData";

export interface MilestoneLockStatus {
  milestoneId: string;
  projectId: string;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  locks: MilestoneLock[];
  isContentLocked: boolean;
  isFinancialLocked: boolean;
  paymentReminderActive: boolean;
}

/**
 * Hook to manage milestone-based locks and reminders
 * For 25-day projects:
 * - Day 5: Payment reminder
 * - Day 10: Content lock (no new content)
 * - Day 10: Financial lock (no new expenses)
 */
export function useMilestoneLocks() {
  const [milestoneLockStatuses, setMilestoneLockStatuses] = useState<MilestoneLockStatus[]>([]);

  useEffect(() => {
    const checkMilestoneLocks = () => {
      const today = new Date();
      const lockStatuses: MilestoneLockStatus[] = [];

      projectList.forEach((project) => {
        project.milestones.forEach((milestone) => {
          // Calculate days elapsed since milestone start date
          const startDate = new Date(project.startDate);
          const daysElapsed = Math.ceil(
            (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Get the milestone's day number from the dayNumber field
          const milestoneDayNumber = milestone.dayNumber || 0;

          // Get locks for this milestone
          const milestoneLocksList = milestoneLocks.filter(
            (lock) => lock.milestoneId === milestone.id && lock.isActive
          );

          // Check if content is locked (day 10 or later for 25-day milestones)
          const isContentLocked = milestoneLocksList.some(
            (lock) => lock.lockType === "content" && daysElapsed >= lock.lockDay
          );

          // Check if financial is locked (day 10 or later for 25-day milestones)
          const isFinancialLocked = milestoneLocksList.some(
            (lock) => lock.lockType === "financial" && daysElapsed >= lock.lockDay
          );

          // Check if payment reminder is active (day 5 for 25-day milestones)
          const paymentReminderActive = milestoneLocksList.some(
            (lock) => lock.lockType === "payment-reminder" && daysElapsed >= lock.lockDay
          );

          // Calculate total days for the milestone (typically 25 for phase milestones)
          const endDate = new Date(milestone.dueDate);
          const totalDays = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const daysRemaining = Math.max(0, totalDays - daysElapsed);

          lockStatuses.push({
            milestoneId: milestone.id,
            projectId: project.id,
            daysElapsed,
            daysRemaining,
            totalDays,
            locks: milestoneLocksList,
            isContentLocked,
            isFinancialLocked,
            paymentReminderActive,
          });
        });
      });

      setMilestoneLockStatuses(lockStatuses);
    };

    // Check on mount
    checkMilestoneLocks();

    // Check every hour for lock status changes
    const interval = setInterval(checkMilestoneLocks, 3600000);

    return () => clearInterval(interval);
  }, []);

  // Utility function to check if specific milestone is content locked
  const isContentLocked = (milestoneId: string): boolean => {
    const status = milestoneLockStatuses.find((s) => s.milestoneId === milestoneId);
    return status?.isContentLocked ?? false;
  };

  // Utility function to check if specific milestone is financial locked
  const isFinancialLocked = (milestoneId: string): boolean => {
    const status = milestoneLockStatuses.find((s) => s.milestoneId === milestoneId);
    return status?.isFinancialLocked ?? false;
  };

  // Utility function to check if payment reminder is active for milestone
  const hasPaymentReminder = (milestoneId: string): boolean => {
    const status = milestoneLockStatuses.find((s) => s.milestoneId === milestoneId);
    return status?.paymentReminderActive ?? false;
  };

  // Get lock status for a specific milestone
  const getMilestoneLockStatus = (milestoneId: string): MilestoneLockStatus | undefined => {
    return milestoneLockStatuses.find((s) => s.milestoneId === milestoneId);
  };

  return {
    milestoneLockStatuses,
    isContentLocked,
    isFinancialLocked,
    hasPaymentReminder,
    getMilestoneLockStatus,
  };
}
