import { Search } from "lucide-react";
import { TaskStatus, statusConfig, projects } from "@/data/mockData";

interface TaskFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: TaskStatus | "all";
  onStatusChange: (value: TaskStatus | "all") => void;
  filterProject: string;
  onProjectChange: (value: string) => void;
}

export function TaskFilterBar({
  search,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterProject,
  onProjectChange,
}: TaskFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
      {/* Search */}
      <div className="relative flex-1 sm:flex-none">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Status Filter */}
      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus | "all")}
        className="text-sm bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
      >
        <option value="all">All Status</option>
        {(Object.keys(statusConfig) as TaskStatus[]).map((s) => (
          <option key={s} value={s}>
            {statusConfig[s].label}
          </option>
        ))}
      </select>

      {/* Project Filter */}
      <select
        value={filterProject}
        onChange={(e) => onProjectChange(e.target.value)}
        className="text-sm bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
      >
        <option value="all">All Projects</option>
        {projects.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
