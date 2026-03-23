import { useState } from "react";
import { Task, TaskStatus } from "@/data/mockData";

export function useTaskFilters(allTasks: Task[]) {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = allTasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterProject !== "all" && t.project !== filterProject) return false;
    if (
      search &&
      !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !t.assignee.name.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return {
    filterStatus,
    setFilterStatus,
    filterProject,
    setFilterProject,
    search,
    setSearch,
    filtered,
  };
}
