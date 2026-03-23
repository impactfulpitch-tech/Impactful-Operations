import { projectList, Task } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";
import { Calendar, AlertCircle, CheckCircle2, Clock, AlertTriangle, Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { logActivity } from "@/hooks/useActivityLog";

export default function Timeline() {
  const { user } = useAuth();
  const isAdmin = user?.type === "admin";
  
  // Auto-refresh tasks data every second
  const { tasks: allTasks } = useAutoRefreshAnalytics();
  const [tasks, setTasks] = useState(allTasks);
  
  useEffect(() => {
    setTasks(allTasks);
  }, [allTasks]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; // Show 30 tasks per page in timeline

  // Sort tasks by start date
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Get date range
  const allDates = tasks.flatMap((t) => [t.startDate, t.dueDate]);
  const minDate = new Date(Math.min(...allDates.map((d) => new Date(d).getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => new Date(d).getTime())));

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Generate weeks for header
  const weeks: Array<{ date: string; label: string }> = [];
  let currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    weeks.push({
      date: currentDate.toISOString().split("T")[0],
      label: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Helper to check if task is overdue
  const isOverdue = (task: any) => new Date(task.dueDate) < today && task.status !== "done";

  // Helper to calculate progress
  const getProgress = (task: any) => {
    const start = new Date(task.startDate);
    const end = new Date(task.dueDate);
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const handleAddTask = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = (data: Record<string, any>) => {
    const newTask = {
      id: `T${Date.now()}`,
      title: data.title,
      project: data.project,
      status: data.status,
      assignee: { id: "default", name: data.assignee || "Unassigned", avatar: "?" },
      priority: "medium",
      dueDate: data.dueDate || new Date().toISOString().split("T")[0],
      startDate: data.startDate || new Date().toISOString().split("T")[0],
      department: data.department || "General",
      dependencies: [],
    };
    setTasks([...tasks, newTask]);
    logActivity({
      type: "add",
      entity: "task",
      title: data.title,
      description: `Timeline task created - Project: ${data.project}`,
      user: "HR Admin",
    });
    setShowAddModal(false);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleEditSubmit = (data: Record<string, any>) => {
    if (selectedTask) {
      setTasks(
        tasks.map((t) =>
          t.id === selectedTask.id
            ? { ...t, title: data.title, project: data.project, startDate: data.startDate, dueDate: data.dueDate || t.dueDate }
            : t
        )
      );
      logActivity({
        type: "edit",
        entity: "task",
        title: data.title,
        description: `Timeline task updated - Project: ${data.project}`,
        user: "HR Admin",
      });
      setShowEditModal(false);
      setSelectedTask(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (selectedTask) {
      setTasks(tasks.filter((t) => t.id !== selectedTask.id));
      logActivity({
        type: "delete",
        entity: "task",
        title: selectedTask.title,
        description: `Timeline task deleted from project ${selectedTask.project}`,
        user: "HR Admin",
      });
      setShowDeleteConfirm(false);
      setSelectedTask(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                Project Timeline
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Track all tasks across your projects</p>
            </div>
            {isAdmin && (
              <button
                onClick={handleAddTask}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Timeline View */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
            {/* Pagination Controls - Top */}
            {sortedTasks.length > itemsPerPage && (
              <div className="border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, sortedTasks.length)}</span> to{" "}
                  <span className="font-semibold">{Math.min(currentPage * itemsPerPage, sortedTasks.length)}</span> of{" "}
                  <span className="font-semibold">{sortedTasks.length}</span> tasks
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <span className="text-sm text-slate-700 dark:text-slate-300 min-w-max">
                    Page {currentPage} of {Math.ceil(sortedTasks.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(sortedTasks.length / itemsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(sortedTasks.length / itemsPerPage)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 w-12">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 w-64 sticky left-0 z-10 bg-slate-50 dark:bg-slate-700/50">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">
                      Assignee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">
                      Start
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">
                      Due
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">
                      Progress
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">
                      Status
                    </th>
                    {isAdmin && <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((task, index) => (
                    <tr
                      key={task.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-4 font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 text-center text-xs">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-800">
                        <div>
                          <p className="font-semibold text-sm">{task.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {task.project}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                            {task.assignee.avatar}
                          </div>
                          <span className="text-slate-600 dark:text-slate-400">{task.assignee.name.split(" ")[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(task.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-1">
                          {isOverdue(task) && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={isOverdue(task) ? "text-red-600 dark:text-red-400 font-medium" : "text-slate-600 dark:text-slate-400"}>
                            {new Date(task.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                task.status === "done"
                                  ? "bg-emerald-500"
                                  : isOverdue(task)
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${getProgress(task)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {Math.round(getProgress(task))}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            task.status === "done"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : task.status === "blocked"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : task.status === "in-progress"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {task.status === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {task.status === "blocked" && <AlertCircle className="w-3.5 h-3.5" />}
                          {task.status === "in-progress" && <Clock className="w-3.5 h-3.5" />}
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("-", " ")}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls - Bottom */}
            {sortedTasks.length > itemsPerPage && (
              <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-center bg-slate-50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.ceil(sortedTasks.length / itemsPerPage) }).map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${
                          currentPage === idx + 1
                            ? "bg-blue-600 text-white"
                            : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(sortedTasks.length / itemsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(sortedTasks.length / itemsPerPage)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{tasks.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500/20" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {tasks.filter((t) => t.status === "done").length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {tasks.filter((t) => t.status === "in-progress").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500/20" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {tasks.filter((t) => isOverdue(t)).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal title="Add Task" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <Form
          fields={[
            { name: "title", label: "Task Title", type: "text", placeholder: "Enter task title", required: true },
            { name: "project", label: "Project", type: "text", placeholder: "Project name", required: true },
            { name: "startDate", label: "Start Date", type: "text", placeholder: "YYYY-MM-DD", required: true },
            { name: "dueDate", label: "Due Date", type: "text", placeholder: "YYYY-MM-DD", required: true },
            { name: "assignee", label: "Assignee", type: "text", placeholder: "Team member name" },
          ]}
          onSubmit={handleAddSubmit}
          submitLabel="Create Task"
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal title="Edit Task" isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        {selectedTask && (
          <Form
            fields={[
              { name: "title", label: "Task Title", type: "text", placeholder: "Enter task title", required: true },
              { name: "project", label: "Project", type: "text", placeholder: "Project name", required: true },
              { name: "startDate", label: "Start Date", type: "text", placeholder: "YYYY-MM-DD", required: true },
              { name: "dueDate", label: "Due Date", type: "text", placeholder: "YYYY-MM-DD", required: true },
            ]}
            initialData={selectedTask}
            onSubmit={handleEditSubmit}
            submitLabel="Update Task"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal title="Delete Task" isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <strong>{selectedTask?.title}</strong>? This action cannot be undone.
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
  );
}
