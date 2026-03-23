import { useTodayTasks } from "@/hooks/useTeamStats";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";
import { PageHeader } from "@/components/PageHeader";
import { AddAdminButton } from "@/components/AddAdminButton";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { StatGrid } from "@/components/StatGrid";
import { Section } from "@/components/Section";
import { TaskRow } from "@/components/TaskRow";
import { Sun, CheckCircle2, Clock, AlertTriangle, Zap, Target, TrendingUp, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { logActivity } from "@/hooks/useActivityLog";

export default function Today() {
  const { user } = useAuth();
  const isAdmin = user?.type === "admin";

  // Auto-refresh tasks data every second
  const { tasks: allTasks } = useAutoRefreshAnalytics();
  const [tasksState, setTasks] = useState(allTasks);

  // Update state when auto-refresh data changes
  useEffect(() => {
    setTasks(allTasks);
  }, [allTasks]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("allTasks", JSON.stringify(tasksState));
  }, [tasksState]);

  // Filter tasks based on user type
  const tasks = user?.type === "team-member"
    ? tasksState.filter(task => task.assignee?.name === user.name)
    : tasksState;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { dueTodayTasks, overdueTasks, completedToday, blockedItems } = useTodayTasks(tasks);

  const handleAddTodaysWork = () => {
    setShowAddModal(true);
  };

  const handleAddWorkSubmit = (data: Record<string, any>) => {
    const newTask = {
      id: `W${Date.now()}`,
      title: data.title,
      project: data.project,
      status: "in-progress",
      assignee: { id: "default", name: data.assignee || user?.name || "Unassigned", avatar: "?" },
      priority: data.priority || "medium",
      dueDate: new Date().toISOString().split("T")[0],
      startDate: new Date().toISOString().split("T")[0],
      department: data.department || "General",
      dependencies: [],
      comments: [],
    };
    setTasks([...tasksState, newTask]);
    logActivity({
      type: "add",
      entity: "task",
      title: data.title,
      description: `Today's task added - Priority: ${data.priority || "medium"}`,
      user: user?.name || "HR Admin",
    });
    setShowAddModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasksState.find((t) => t.id === taskId);
    if (task) {
      setSelectedTaskId(taskId);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (selectedTaskId) {
      const task = tasksState.find((t) => t.id === selectedTaskId);
      setTasks(tasksState.filter((t) => t.id !== selectedTaskId));
      if (task) {
        logActivity({
          type: "delete",
          entity: "task",
          title: task.title,
          description: `Task deleted from Today's view - Project: ${task.project}`,
          user: user?.name || "HR Admin",
        });
      }
      setShowDeleteConfirm(false);
      setSelectedTaskId(null);
    }
  };

  const completionRate = dueTodayTasks.length > 0 ? Math.round((completedToday.length / (dueTodayTasks.length + completedToday.length)) * 100) : 0;
  const hours = new Date().getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header with Greeting */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Sun className="w-8 h-8 text-slate-400 dark:text-slate-600" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
                {greeting}, team!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
        </div>

        {/* Hero Stats - Professional Theme */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Due Today - Slate */}
          <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Clock className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Due Today</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{dueTodayTasks.length}</p>
              </div>
            </div>
          </div>

          {/* Overdue - Conditional Color */}
          <div className={`rounded-xl overflow-hidden border transition-all duration-300 p-6 ${
            overdueTasks.length > 0
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
          }`}>
            <div className="space-y-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                overdueTasks.length > 0
                  ? "bg-red-200 dark:bg-red-900/50"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}>
                {overdueTasks.length > 0 ? 
                  <Flame className="w-6 h-6 text-red-700 dark:text-red-400" /> : 
                  <CheckCircle2 className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                }
              </div>
              <div>
                <p className={`text-sm font-semibold ${
                  overdueTasks.length > 0
                    ? "text-red-700 dark:text-red-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}>Overdue</p>
                <p className={`text-3xl font-bold mt-1 ${
                  overdueTasks.length > 0
                    ? "text-red-900 dark:text-red-200"
                    : "text-slate-900 dark:text-slate-100"
                }`}>{overdueTasks.length}</p>
              </div>
            </div>
          </div>

          {/* Completed - Slate/Slate */}
          <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Completed Today</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{completedToday.length}</p>
              </div>
            </div>
          </div>

          {/* Blocked - Slate */}
          <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Blocked Items</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{blockedItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Focus Mode - Priority Tasks */}
        {dueTodayTasks.filter(t => t.priority === "urgent" || t.priority === "high").length > 0 && (
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-red-700 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Priority Tasks</h2>
            </div>
            <div className="space-y-2">
              {dueTodayTasks.filter(t => t.priority === "urgent" || t.priority === "high").map((task) => (
                <div key={task.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border-l-4 border-slate-400 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{task.project}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ${
                      task.priority === "urgent" 
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Progress */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              Daily Progress
            </h3>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-slate-700 dark:bg-slate-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
            {completedToday.length} of {dueTodayTasks.length + completedToday.length} tasks completed
          </p>
        </div>

        {/* Add Today's Work Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAddTodaysWork}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Zap className="w-5 h-5" />
            Add Today's Work
          </button>
        </div>

        {/* Due Today */}
        <Section title="📋 Due Today" count={dueTodayTasks.length} emptyText="Nothing due today! 🎉">
          <div className="space-y-2">
            {dueTodayTasks.map((task) => (
              <TaskRow key={task.id} task={task} onDelete={handleDeleteTask} showActions={isAdmin} />
            ))}
          </div>
        </Section>

        {/* Overdue — Needs Action */}
        {overdueTasks.length > 0 && (
          <Section title="⚠️ Overdue — Needs Action" count={overdueTasks.length}>
            <div className="space-y-2">
              {overdueTasks.map((task) => (
                <TaskRow key={task.id} task={task} showReason onDelete={handleDeleteTask} showActions={isAdmin} />
              ))}
            </div>
          </Section>
        )}

        {/* Completed */}
        {completedToday.length > 0 && (
          <Section title="✅ Done Today" count={completedToday.length}>
            <div className="space-y-2">
              {completedToday.map((task) => (
                <TaskRow key={task.id} task={task} onDelete={handleDeleteTask} showActions={isAdmin} />
              ))}
            </div>
          </Section>
        )}

        {/* Blocked */}
        {blockedItems.length > 0 && (
          <Section title="🚫 Blocked / Waiting" count={blockedItems.length}>
            <div className="space-y-2">
              {blockedItems.map((task) => (
                <TaskRow key={task.id} task={task} showReason onDelete={handleDeleteTask} showActions={isAdmin} />
              ))}
            </div>
          </Section>
        )}

        {/* Add Today's Work Modal */}
        <Modal title="Add Today's Work" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <Form
            fields={[
              { name: "title", label: "Task Title", type: "text", placeholder: "What are you working on?", required: true },
              { name: "project", label: "Project", type: "text", placeholder: "Project name", required: true },
              {
                name: "priority",
                label: "Priority",
                type: "select",
                options: [
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ],
              },
              { name: "assignee", label: "Assignee", type: "text", placeholder: "Your name or team member" },
            ]}
            onSubmit={handleAddWorkSubmit}
            submitLabel="Add to Today"
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal title="Delete Task" isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
