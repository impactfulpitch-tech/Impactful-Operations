import { useEffect, useState } from 'react';

export interface PaymentReminderStatus {
  shouldShowReminder: boolean;
  daysElapsed: number;
  reminderMessage: string;
}

/**
 * Hook to check if payment reminder should show at 5 days
 * Sends a reminder notification when project reaches 5-day mark
 */
export function usePaymentReminderAt5Days(
  startDate: string,
  projectName: string,
  paymentReminderSent: boolean
): PaymentReminderStatus {
  const [reminderStatus, setReminderStatus] = useState<PaymentReminderStatus>({
    shouldShowReminder: false,
    daysElapsed: 0,
    reminderMessage: '',
  });

  useEffect(() => {
    const checkReminder = () => {
      const start = new Date(startDate).getTime();
      const now = new Date().getTime();
      const elapsed = now - start;
      const daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));

      // Show reminder when 5 days have passed and it hasn't been sent yet
      const shouldShow = daysElapsed >= 5 && !paymentReminderSent;

      setReminderStatus({
        shouldShowReminder: shouldShow,
        daysElapsed,
        reminderMessage: `Payment reminder for "${projectName}" - 5 days have elapsed. Please review and process payment if applicable.`,
      });

      // Store that reminder was shown (in real app, update project in localStorage)
      if (shouldShow) {
        const projects = localStorage.getItem('allProjects');
        if (projects) {
          const parsed = JSON.parse(projects);
          const updated = parsed.map((p: any) => ({
            ...p,
            paymentReminderSentAt5Days: p.name === projectName ? true : p.paymentReminderSentAt5Days,
          }));
          localStorage.setItem('allProjects', JSON.stringify(updated));
        }
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [startDate, projectName, paymentReminderSent]);

  return reminderStatus;
}
