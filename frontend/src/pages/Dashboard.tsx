import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTodayTasks } from "@/hooks/useTeamStats";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Auto-refresh all analytics data every second
  const { tasks, projects } = useAutoRefreshAnalytics();
  
  // Filter tasks based on user type
  const displayTasks = user?.type === "team-member"
    ? tasks.filter(task => task.assignee?.name === user.name)
    : tasks;
  
  const { overdueTasks, blockedTasks, inProgressTasks, departments, projectFlow } = useDashboardStats(displayTasks);
  const { dueTodayTasks, overdueTasks: todayOverdueTasks, completedToday } = useTodayTasks(displayTasks);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {user?.type === "team-member" ? `Welcome back, ${user.name}. Manage your projects and tasks here.` : "Manage all projects and team performance"}
              </p>
            </div>
            <button
              onClick={() => navigate("/tasks")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              + New Task
            </button>
          </div>

          {/* Team Member Access Notice */}
          {user?.type === "team-member" && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <div className="text-xl mt-0.5">ℹ️</div>
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">Your Account Access:</p>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  You can access Tasks, Projects, Team, Timeline, and Today's dashboard. Payment details are managed by admin staff only and won't appear in your account.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{displayTasks.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              ↑ {user?.type === "team-member" ? "Assigned to you" : "Across projects"}
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{inProgressTasks.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              ↑ {displayTasks.length > 0 ? `${((inProgressTasks.length / displayTasks.length) * 100).toFixed(0)}% of total` : "No tasks"}
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Overdue</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{overdueTasks.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">Need attention</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Departments</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{departments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Active teams</p>
          </div>
        </div>

        {/* Today's Tasks Section */}
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Tasks</h2>
            <button
              onClick={() => navigate("/today")}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {dueTodayTasks.length > 0 ? (
              dueTodayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="px-6 py-4 hover:bg-white dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {task.project}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${
                          task.status === "done" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
                          task.status === "in-progress" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                          "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}>
                          {task.status === "done" ? "✓ Completed" : task.status === "in-progress" ? "In Progress" : "To Do"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{task.assignee?.name || "Unassigned"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                No tasks due today
              </div>
            )}
          </div>
        </div>

        {/* Active Projects Table */}
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Projects</h2>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{projectFlow.length} projects</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {projectFlow.map(({ proj }, index) => (
                  <tr key={proj} className="hover:bg-white dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 dark:text-white">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{proj}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate("/milestones")}
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Performance Table */}
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Department Performance</h2>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{departments.length} departments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Total Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {departments.map(({ dept, done, total }) => (
                  <tr key={dept} className="hover:bg-white dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{dept}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{total}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
                        {done}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/tasks?department=${encodeURIComponent(dept)}`)}
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

