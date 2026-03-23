import { Task } from "@/data/mockData";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { Calendar, AlertTriangle, Edit2, Trash2, Paperclip, ExternalLink, Plus } from "lucide-react";

interface TaskTableProps {
  tasks: Task[];
  showDepartment?: boolean;
  showProject?: boolean;
  compact?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onAddChatGPTLink?: (taskId: string) => void;
  showActions?: boolean;
}

export function TaskTable({ tasks, showDepartment = false, showProject = true, compact = false, onEdit, onDelete, onAddChatGPTLink, showActions = false }: TaskTableProps) {
  
  // Helper to get ChatGPT links for a task
  const getTaskChatGPTLinks = (taskId: string) => {
    const storedLinks = localStorage.getItem(`taskChatGPTLinks_${taskId}`);
    if (!storedLinks) return [];
    const links = JSON.parse(storedLinks);
    return links.filter((link: any) => link.category === 'chatgpt');
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No tasks to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
              <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 w-12">#</th>
              {!compact && <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 w-16 hidden sm:table-cell">ID</th>}
              <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 min-w-[180px]">Task</th>
              <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 whitespace-nowrap">Status</th>
              <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 hidden md:table-cell whitespace-nowrap">Priority</th>
              <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 hidden lg:table-cell">Assignee</th>
              {showProject && <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 hidden xl:table-cell">Project</th>}
              {showDepartment && <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 hidden xl:table-cell">Department</th>}
              <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 whitespace-nowrap">Due Date</th>
              <th className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 hidden sm:table-cell">ChatGPT</th>
              {showActions && <th className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-3.5 w-20">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";
              return (
                <tr
                  key={task.id}
                  className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                >
                  <td className="px-5 sm:px-6 py-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded">{index + 1}</span>
                  </td>
                  {!compact && (
                    <td className="px-5 sm:px-6 py-3 hidden sm:table-cell">
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">{task.id}</span>
                    </td>
                  )}
                  <td className="px-5 sm:px-6 py-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs text-sm">{task.title}</p>
                      {task.blockedReason && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {task.blockedReason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-5 sm:px-6 py-3 hidden md:table-cell">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-5 sm:px-6 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        {task.assignee.avatar}
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{task.assignee.name.split(" ")[0]}</span>
                    </div>
                  </td>
                  {showProject && (
                    <td className="px-5 sm:px-6 py-3 hidden xl:table-cell">
                      <span className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium truncate inline-block">
                        {task.project}
                      </span>
                    </td>
                  )}
                  {showDepartment && (
                    <td className="px-5 sm:px-6 py-3 hidden xl:table-cell">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{task.department}</span>
                    </td>
                  )}
                  <td className="px-5 sm:px-6 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {isOverdue && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="hidden sm:inline">Overdue</span>
                          <span className="sm:hidden">OVD</span>
                        </div>
                      )}
                      {!isOverdue && (
                        <span>{new Date(task.dueDate).toLocaleDateString("en-IN", { month: "2-digit", day: "2-digit" })}</span>
                      )}
                    </div>
                  </td>

                  {/* ChatGPT Link Button */}
                  <td className="px-5 sm:px-6 py-3 hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {getTaskChatGPTLinks(task.id).length > 0 ? (
                        <a
                          href={getTaskChatGPTLinks(task.id)[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                          title="Open ChatGPT conversation"
                        >
                          🤖
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          onClick={() => onAddChatGPTLink?.(task.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          title="Add ChatGPT link"
                        >
                          🤖
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>

                  {showActions && (
                    <td className="px-5 sm:px-6 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(task)}
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(task.id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
