import { AlertTriangle, Calendar, X, DollarSign } from "lucide-react";
import { useProjectReminders } from "@/hooks/useProjectReminders";
import { usePaymentReminders } from "@/hooks/usePaymentReminders";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

/**
 * Persistent Reminder Banner
 * Shows at top of app if there are overdue or urgent reminders
 * Includes payment reminders for admin users
 * Stays visible until dismissed for this session
 */
export function RemindersAlertBanner() {
  const { reminders, hasOverdue } = useProjectReminders();
  const { reminders: paymentReminders } = usePaymentReminders();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const isAdmin = user?.type === "admin";
  const allReminders = reminders;
  const allPaymentReminders = isAdmin ? paymentReminders : [];

  // Check if should show banner
  useEffect(() => {
    const hasOverdueReminders = allReminders.some(r => r.isOverdue);
    const hasOverduePayments = allPaymentReminders.some(r => r.status === "overdue");
    
    if (!dismissed && (hasOverdue || hasOverdueReminders || hasOverduePayments)) {
      setShowBanner(true);
    }
  }, [hasOverdue, allReminders, allPaymentReminders, dismissed]);

  if (!showBanner) return null;

  const overdueCount = allReminders.filter(r => r.isOverdue).length;
  const overduePaymentCount = allPaymentReminders.filter(r => r.status === "overdue").length;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-50 dark:bg-red-950/30 border-b-2 border-red-500 z-40">
      <div className="max-w-full px-3 sm:px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-red-700 dark:text-red-300 text-sm sm:text-base">
                ⚠️ {overdueCount + overduePaymentCount} Overdue Reminder{overdueCount + overduePaymentCount !== 1 ? "s" : ""}
              </p>
              <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex flex-col gap-1 mt-1">
                {overdueCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{overdueCount} overdue project{overdueCount !== 1 ? "s" : ""}</span>
                  </span>
                )}
                {isAdmin && overduePaymentCount > 0 && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 flex-shrink-0" />
                    <span>{overduePaymentCount} overdue payment{overduePaymentCount !== 1 ? "s" : ""}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  📌 Click the bell icon to view and manage reminders
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setShowBanner(false);
              setDismissed(true);
            }}
            className="p-1 rounded hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors flex-shrink-0 mt-0.5"
            title="Dismiss banner for this session"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
