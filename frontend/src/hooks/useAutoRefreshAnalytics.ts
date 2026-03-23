import { useEffect, useState } from 'react';

interface AnalyticsData {
  tasks: any[];
  projects: any[];
  teamMembers: any[];
  invoices: any[];
  milestones: any[];
  reminders: any[];
  clientSheets: any[];
}

/**
 * Custom hook for automatic analytics refresh
 * Polls localStorage for changes and updates every 1 second
 */
export function useAutoRefreshAnalytics(): AnalyticsData {
  const [data, setData] = useState<AnalyticsData>({
    tasks: [],
    projects: [],
    teamMembers: [],
    invoices: [],
    milestones: [],
    reminders: [],
    clientSheets: [],
  });

  useEffect(() => {
    // Function to fetch all data from localStorage
    const fetchData = () => {
      const tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
      const projects = JSON.parse(localStorage.getItem('allProjects') || '[]');
      const teamMembers = JSON.parse(localStorage.getItem('allTeamMembers') || '[]');
      const invoices = JSON.parse(localStorage.getItem('allInvoices') || '[]');
      const milestones = JSON.parse(localStorage.getItem('allMilestones') || '[]');
      const reminders = JSON.parse(localStorage.getItem('allReminders') || '[]');
      const clientSheets = JSON.parse(localStorage.getItem('clientSheets') || '[]');

      setData({
        tasks,
        projects,
        teamMembers,
        invoices,
        milestones,
        reminders,
        clientSheets,
      });
    };

    // Initial fetch
    fetchData();

    // Set up auto-refresh every 1 second
    const interval = setInterval(fetchData, 1000);

    // Listen for storage changes (for multi-tab sync)
    window.addEventListener('storage', fetchData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', fetchData);
    };
  }, []);

  return data;
}
