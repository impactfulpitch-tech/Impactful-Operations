import { useState, useEffect } from 'react';

export interface ActivityLog {
  id: string;
  type: 'add' | 'edit' | 'delete';
  entity: 'task' | 'team' | 'client' | 'milestone' | 'project' | 'invoice';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

const STORAGE_KEY = 'activity_logs';

export function useActivityLog() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setActivities(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse activity logs:', e);
      }
    }
  }, []);

  const addActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newActivity, ...activities].slice(0, 50); // Keep last 50 activities
    setActivities(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { activities, addActivity, clearActivities };
}

export function getActivityLogs(): ActivityLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
  const activities = getActivityLogs();
  const newActivity: ActivityLog = {
    ...activity,
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  
  const updated = [newActivity, ...activities].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
