import { Task, teamMembers } from "@/data/mockData";

interface DashboardStats {
  overdueTasks: Task[];
  blockedTasks: Task[];
  completedTasks: Task[];
  inProgressTasks: Task[];
  departments: Array<{
    dept: string;
    todo: number;
    inProg: number;
    review: number;
    done: number;
    blocked: number;
    overdue: number;
    total: number;
    progress: number;
    members: typeof teamMembers;
  }>;
  projectFlow: Array<{
    proj: string;
    done: number;
    total: number;
    blocked: number;
    overdue: number;
    progress: number;
  }>;
}

export function useDashboardStats(tasks: Task[]): DashboardStats {
  const today = new Date().toISOString().split("T")[0];

  const overdueTasks = tasks.filter((t) => t.dueDate < today && t.status !== "done");
  const blockedTasks = tasks.filter((t) => t.status === "blocked" || t.status === "waiting");
  const completedTasks = tasks.filter((t) => t.status === "done");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");

  // Department flow data
  const departments = [...new Set(teamMembers.map((m) => m.department))].map((dept) => {
    const deptTasks = tasks.filter((t) => t.department === dept);
    const todo = deptTasks.filter((t) => t.status === "todo").length;
    const inProg = deptTasks.filter((t) => t.status === "in-progress").length;
    const review = deptTasks.filter((t) => t.status === "review").length;
    const done = deptTasks.filter((t) => t.status === "done").length;
    const blocked = deptTasks.filter((t) => t.status === "blocked" || t.status === "waiting").length;
    const overdue = deptTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "done").length;
    const total = deptTasks.length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    const members = teamMembers.filter((m) => m.department === dept);
    return { dept, todo, inProg, review, done, blocked, overdue, total, progress, members };
  });

  // Project flow data
  const projects = [...new Set(tasks.map((t) => t.project))];
  const projectFlow = projects.map((proj) => {
    const projTasks = tasks.filter((t) => t.project === proj);
    const done = projTasks.filter((t) => t.status === "done").length;
    const total = projTasks.length;
    const blocked = projTasks.filter((t) => t.status === "blocked" || t.status === "waiting").length;
    const overdue = projTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "done").length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return { proj, done, total, blocked, overdue, progress };
  });

  return {
    overdueTasks,
    blockedTasks,
    completedTasks,
    inProgressTasks,
    departments,
    projectFlow,
  };
}
