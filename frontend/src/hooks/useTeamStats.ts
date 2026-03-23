import { Task, TeamMember, teamMembers as allTeamMembers, tasks as allTasks } from "@/data/mockData";

interface MemberStats {
  member: TeamMember;
  memberTasks: Task[];
  active: number;
  done: number;
  overdue: number;
  load: "high" | "medium" | "low";
}

export function useTeamStats(teamMembers: TeamMember[], tasks: Task[]) {
  const membersData: MemberStats[] = teamMembers.map((member) => {
    const memberTasks = tasks.filter((t) => t.assignee.id === member.id);
    const active = memberTasks.filter((t) => t.status !== "done").length;
    const done = memberTasks.filter((t) => t.status === "done").length;
    const overdue = memberTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "done").length;
    const load = active > 4 ? "high" : active > 2 ? "medium" : "low";
    return { member, memberTasks, active, done, overdue, load };
  });

  const totalActive = membersData.reduce((s, d) => s + d.active, 0);
  const totalDone = membersData.reduce((s, d) => s + d.done, 0);
  const totalOverdue = membersData.reduce((s, d) => s + d.overdue, 0);
  const heavyLoad = membersData.filter((d) => d.load === "high").length;

  return {
    membersData,
    totalActive,
    totalDone,
    totalOverdue,
    heavyLoad,
  };
}

export function useTodayTasks(tasks: Task[]) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const dueTodayTasks = tasks.filter((t) => t.dueDate === today);
  const overdueTasks = tasks.filter((t) => t.dueDate < today && t.status !== "done");
  const completedToday = tasks.filter((t) => t.status === "done" && t.dueDate <= today);
  const movingToTomorrow = overdueTasks.filter((t) => t.status !== "blocked" && t.status !== "waiting");
  const blockedItems = tasks.filter((t) => t.status === "blocked" || t.status === "waiting");

  return {
    today,
    tomorrow,
    dueTodayTasks,
    overdueTasks,
    completedToday,
    movingToTomorrow,
    blockedItems,
  };
}
