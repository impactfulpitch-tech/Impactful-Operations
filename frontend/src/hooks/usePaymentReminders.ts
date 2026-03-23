import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { invoices, PaymentReminder } from "@/data/mockData";

/**
 * Hook to check for payment reminders (15 days before invoice due date)
 * Only shows reminders for admin users
 * Displays notification when payment is due soon
 */
export function usePaymentReminders() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [hasShownToday, setHasShownToday] = useState(false);

  useEffect(() => {
    // Only show payment reminders to admin users
    if (user?.type !== "admin") {
      return;
    }

    // Check for due reminders
    const checkReminders = () => {
      const today = new Date();
      const todayDate = today.toISOString().split("T")[0];
      const lastShown = localStorage.getItem("lastPaymentReminderShown");

      // Only show reminders once per day
      if (lastShown === todayDate && hasShownToday) {
        return;
      }

      const dueReminders: PaymentReminder[] = [];

      // Check stored invoices or use default
      const storedInvoices = localStorage.getItem("allInvoices");
      const invoicesToCheck = storedInvoices ? JSON.parse(storedInvoices) : invoices;

      invoicesToCheck.forEach((invoice: any) => {
        if (!invoice.dueDate || invoice.status === "paid" || invoice.status === "cancelled") {
          return;
        }

        const dueDate = new Date(invoice.dueDate);
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Trigger reminder at exactly 15 days before due date
        if (daysUntilDue === 15) {
          dueReminders.push({
            id: `reminder-${invoice.id}`,
            invoiceId: invoice.id,
            projectId: invoice.projectId,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            currency: invoice.currency,
            daysUntilDue,
            dueDate: invoice.dueDate,
            clientName: invoice.clientName,
            status: invoice.status,
          });
        }

        // Check for overdue payments
        if (daysUntilDue < 0 && invoice.status === "sent") {
          dueReminders.push({
            id: `reminder-overdue-${invoice.id}`,
            invoiceId: invoice.id,
            projectId: invoice.projectId,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            currency: invoice.currency,
            daysUntilDue,
            dueDate: invoice.dueDate,
            clientName: invoice.clientName,
            status: "overdue",
          });
        }
      });

      if (dueReminders.length > 0) {
        setReminders(dueReminders);

        // Show toast notification for each payment reminder
        dueReminders.forEach((reminder) => {
          const message = reminder.status === "overdue"
            ? `Payment from ${reminder.clientName} (${reminder.invoiceNumber}) is overdue by ${Math.abs(reminder.daysUntilDue)} days! Amount: ₹${reminder.amount.toLocaleString()}`
            : `Payment from ${reminder.clientName} (${reminder.invoiceNumber}) due in 15 days (${reminder.dueDate}). Amount: ₹${reminder.amount.toLocaleString()}`;

          toast({
            title: reminder.status === "overdue" ? "⚠️ Overdue Payment" : "💳 Payment Reminder",
            description: message,
            duration: 10000,
            className: reminder.status === "overdue"
              ? "bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500"
              : "bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500",
          });
        });

        // Mark reminders as shown today
        localStorage.setItem("lastPaymentReminderShown", todayDate);
        setHasShownToday(true);
      }
    };

    // Check on mount
    checkReminders();

    // Check every minute for new reminders
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [user?.type, toast, hasShownToday]);

  return { reminders, hasShownToday };
}
