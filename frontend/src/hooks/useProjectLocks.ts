import { useEffect, useState } from 'react';

export interface ProjectLockStatus {
  isContentLocked: boolean;
  isFinancialLocked: boolean;
  daysElapsed: number;
  daysRemainingBeforeLock: number;
}

/**
 * Hook to check if a project should have content/financial locks
 * Content locks after 10 days to prevent further edits
 * Financial locks after 10 days to finalize payments
 */
export function useProjectLocks(startDate: string): ProjectLockStatus {
  const [lockStatus, setLockStatus] = useState<ProjectLockStatus>({
    isContentLocked: false,
    isFinancialLocked: false,
    daysElapsed: 0,
    daysRemainingBeforeLock: 10,
  });

  useEffect(() => {
    const calculateLockStatus = () => {
      const start = new Date(startDate).getTime();
      const now = new Date().getTime();
      const elapsed = now - start;
      const daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
      const daysRemainingBeforeLock = Math.max(0, 10 - daysElapsed);

      setLockStatus({
        isContentLocked: daysElapsed >= 10,
        isFinancialLocked: daysElapsed >= 10,
        daysElapsed,
        daysRemainingBeforeLock,
      });
    };

    calculateLockStatus();
    const interval = setInterval(calculateLockStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [startDate]);

  return lockStatus;
}
