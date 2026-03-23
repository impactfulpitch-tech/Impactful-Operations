import { useEffect } from 'react';
import { tasks as initialTasks, projectList as initialProjects, invoices as initialInvoices } from '@/data/mockData';

/**
 * Hook to initialize localStorage with mock data on first app load
 * This ensures all data operations work properly with localStorage
 */
export function useInitializeStorage() {
  useEffect(() => {
    // Initialize tasks if not already in localStorage
    if (!localStorage.getItem('allTasks')) {
      localStorage.setItem('allTasks', JSON.stringify(initialTasks));
    }

    // Initialize projects if not already in localStorage
    if (!localStorage.getItem('allProjects')) {
      localStorage.setItem('allProjects', JSON.stringify(initialProjects));
    }

    // Initialize invoices if not already in localStorage
    if (!localStorage.getItem('allInvoices')) {
      localStorage.setItem('allInvoices', JSON.stringify(initialInvoices));
    }

    // Initialize activity logs if not present
    if (!localStorage.getItem('activity_logs')) {
      localStorage.setItem('activity_logs', JSON.stringify([]));
    }
  }, []);
}
