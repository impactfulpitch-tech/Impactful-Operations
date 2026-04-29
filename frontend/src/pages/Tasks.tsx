import { Task, tasks as defaultTasks } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useTaskReminders } from "@/hooks/useTaskReminders";
import { PageHeader } from "@/components/PageHeader";
import { AddAdminButton } from "@/components/AddAdminButton";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { TaskFilterBar } from "@/components/TaskFilterBar";
import { TaskTable } from "@/components/TaskTable";
import { ListTodo, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { logActivity } from "@/hooks/useActivityLog";

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.type === "admin";

  // Auto-refresh tasks data every second
  const { tasks: allTasks } = useAutoRefreshAnalytics();

  // Initialize from auto-refreshed data or use default mock data
  const [tasks, setTasks] = useState<Task[]>(allTasks && allTasks.length > 0 ? allTasks : defaultTasks);

  useEffect(() => {
    setTasks(allTasks);
  }, [allTasks]);

  // Use task reminders hook
  useTaskReminders();

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("allTasks", JSON.stringify(tasks));
  }, [tasks]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showChatGPTModal, setShowChatGPTModal] = useState(false);
  const [selectedTaskForChatGPT, setSelectedTaskForChatGPT] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Show 50 tasks per page
  const { filterStatus, setFilterStatus, filterProject, setFilterProject, search, setSearch, filtered } =
    useTaskFilters(tasks);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterProject, search]);

  const handleAddTask = () => {
    setShowAddModal(true);
  };

  const handleAddTaskSubmit = (data: Record<string, any>) => {
    if (!data.startDate || !data.dueDate) {
      alert("Please set both Start Date and Due Date");
      return;
    }

    const startDate = data.startDate;
    const dueDate = data.dueDate;
    
    // Calculate 15-day reminder date
    const dueDateObj = new Date(dueDate);
    const reminderDate = new Date(dueDateObj.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const assigneeName = data.assignee || "Unassigned";
    const newTask = {
      id: `T${Date.now()}`,
      title: data.title,
      description: data.description || "",
      project: data.project,
      status: data.status,
      assignee: { id: "default", name: assigneeName, avatar: assigneeName.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "?" },
      priority: data.priority || "medium",
      dueDate: dueDate,
      startDate: startDate,
      timeline: data.timeline || "1 month",
      department: data.department || "General",
      dependencies: [],
      reminderDate: reminderDate,
      comments: [],
      blockedReason: undefined,
    };
    
    setTasks([...tasks, newTask]);
    logActivity({
      type: "add",
      entity: "task",
      title: data.title,
      description: `Task created for project ${data.project}. Timeline: ${data.timeline || "1 month"}. Due: ${dueDate}`,
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
      const dueDate = data.dueDate || selectedTask.dueDate;
      const dueDateObj = new Date(dueDate);
      const reminderDate = new Date(dueDateObj.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      const assigneeName = data.assignee || selectedTask.assignee.name;
      setTasks(
        tasks.map((t) =>
          t.id === selectedTask.id
            ? {
                ...t,
                title: data.title,
                description: data.description || t.description,
                project: data.project,
                status: data.status,
                assignee: { id: "default", name: assigneeName, avatar: assigneeName.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "?" },
                priority: data.priority || t.priority,
                dueDate: dueDate,
                startDate: data.startDate || t.startDate,
                timeline: data.timeline || t.timeline,
                reminderDate: reminderDate,
              }
            : t
        )
      );
      logActivity({
        type: "edit",
        entity: "task",
        title: data.title,
        description: `Task updated - Status: ${data.status}, Timeline: ${data.timeline || "unchanged"}`,
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
        description: `Task deleted from project ${selectedTask.project}`,
        user: "HR Admin",
      });
      setShowDeleteConfirm(false);
      setSelectedTask(null);
    }
  };

  const handleAddChatGPTLink = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskForChatGPT(task);
      setShowChatGPTModal(true);
    }
  };

  const handleAddChatGPTLinkSubmit = (data: Record<string, any>) => {
    if (selectedTaskForChatGPT) {
      const newLink = {
        id: `L${Date.now()}`,
        url: data.url,
        category: "chatgpt",
        addedDate: new Date().toISOString().split("T")[0],
      };

      // Get existing links or create new array
      const existingLinks = JSON.parse(localStorage.getItem(`taskChatGPTLinks_${selectedTaskForChatGPT.id}`) || '[]');
      existingLinks.push(newLink);
      localStorage.setItem(`taskChatGPTLinks_${selectedTaskForChatGPT.id}`, JSON.stringify(existingLinks));

      logActivity({
        type: "add",
        entity: "task-link",
        title: selectedTaskForChatGPT.title,
        description: `ChatGPT link added: ${data.url}`,
        user: "HR Admin",
      });

      setShowChatGPTModal(false);
      setSelectedTaskForChatGPT(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
        <PageHeader
          title="Tasks"
          subtitle={`${filtered.length} tasks`}
          icon={<ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          action={<AddAdminButton label="Task" onClick={handleAddTask} isAdmin={isAdmin} />}
        />

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 transition-shadow hover:shadow-sm">
          <TaskFilterBar
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterProject={filterProject}
            onProjectChange={setFilterProject}
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Pagination Controls - Top */}
          {filtered.length > itemsPerPage && (
            <div className="border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}</span> to{" "}
                <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{" "}
                <span className="font-semibold">{filtered.length}</span> tasks
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
                  Page {currentPage} of {Math.ceil(filtered.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filtered.length / itemsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(filtered.length / itemsPerPage)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* Paginated Task Table */}
          <TaskTable 
            tasks={filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            showProject 
            showDepartment={false}
            showActions={isAdmin}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onAddChatGPTLink={handleAddChatGPTLink}
          />

          {/* Pagination Controls - Bottom */}
          {filtered.length > itemsPerPage && (
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
                  {Array.from({ length: Math.ceil(filtered.length / itemsPerPage) }).map((_, idx) => (
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
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filtered.length / itemsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(filtered.length / itemsPerPage)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <ListTodo className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No tasks found</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Try adjusting your filters or add a new task</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal title="Add New Task" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <Form
          fields={[
            { name: "title", label: "Task Title", type: "text", placeholder: "Enter task title", required: true },
            { name: "description", label: "Description", type: "textarea", placeholder: "Task description (optional)" },
            { name: "project", label: "Project Name", type: "text", placeholder: "Project name", required: true },
            { name: "assignee", label: "Assign To (Team Member Name)", type: "text", placeholder: "Enter team member name", required: false },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "todo", label: "To Do" },
                { value: "in-progress", label: "In Progress" },
                { value: "review", label: "In Review" },
                { value: "done", label: "Done" },
              ],
              required: true,
            },
            {
              name: "priority",
              label: "Priority",
              type: "select",
              options: [
                { value: "urgent", label: "Urgent" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ],
            },
            { name: "startDate", label: "Start Date", type: "date", required: true },
            { name: "dueDate", label: "Due Date", type: "date", required: true },
            {
              name: "timeline",
              label: "Timeline Duration",
              type: "select",
              options: [
                { value: "1 week", label: "1 Week" },
                { value: "2 weeks", label: "2 Weeks" },
                { value: "1 month", label: "1 Month" },
                { value: "2 months", label: "2 Months" },
                { value: "3 months", label: "3 Months" },
              ],
            },
          ]}
          onSubmit={handleAddTaskSubmit}
          submitLabel="Create Task"
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal title="Edit Task" isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        {selectedTask && (
          <Form
            fields={[
              { name: "title", label: "Task Title", type: "text", placeholder: "Enter task title", required: true },
              { name: "description", label: "Description", type: "textarea", placeholder: "Task description (optional)" },
              { name: "project", label: "Project Name", type: "text", placeholder: "Project name", required: true },
              { name: "assignee", label: "Assign To (Team Member Name)", type: "text", placeholder: "Enter team member name", required: false },
              {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                  { value: "todo", label: "To Do" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "review", label: "In Review" },
                  { value: "done", label: "Done" },
                ],
                required: true,
              },
              {
                name: "priority",
                label: "Priority",
                type: "select",
                options: [
                  { value: "urgent", label: "Urgent" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ],
              },
              { name: "startDate", label: "Start Date", type: "date" },
              { name: "dueDate", label: "Due Date", type: "date" },
              {
                name: "timeline",
                label: "Timeline Duration",
                type: "select",
                options: [
                  { value: "1 week", label: "1 Week" },
                  { value: "2 weeks", label: "2 Weeks" },
                  { value: "1 month", label: "1 Month" },
                  { value: "2 months", label: "2 Months" },
                  { value: "3 months", label: "3 Months" },
                ],
              },
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

      {/* Add ChatGPT Link Modal */}
      <Modal 
        title={selectedTaskForChatGPT ? `Add ChatGPT Link for ${selectedTaskForChatGPT.title}` : "Add ChatGPT Link"} 
        isOpen={showChatGPTModal} 
        onClose={() => {
          setShowChatGPTModal(false);
          setSelectedTaskForChatGPT(null);
        }}
      >
        <Form
          fields={[
            {
              name: "url",
              label: "ChatGPT URL",
              type: "text",
              placeholder: "https://chatgpt.com/c/...",
              required: true,
            },
          ]}
          onSubmit={handleAddChatGPTLinkSubmit}
          submitLabel="Add Link"
        />
      </Modal>
    </div>
  );
}
