import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";
import { useMilestoneLocks } from "@/hooks/useMilestoneLocks";
import { Milestone, Reminder } from "@/data/mockData";
import { projectList as initialProjects } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Flag, Clock, CheckCircle2, Zap, Calendar, Edit2, Trash2, Plus, Lock, DollarSign } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { logActivity } from "@/hooks/useActivityLog";

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  "in-progress": { bg: "bg-purple-50", text: "text-purple-700", icon: Zap },
  completed: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2 },
  flagged: { bg: "bg-red-50", text: "text-red-700", icon: Flag },
};



const reminderTypeColors: Record<string, string> = {
  urgent: "bg-red-50 border-red-200 text-red-700",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
  success: "bg-green-50 border-green-200 text-green-700",
};

export default function Milestones() {
  const { user } = useAuth();
  const isAdmin = user?.type === "admin";
  const { getMilestoneLockStatus } = useMilestoneLocks();
  
  // Auto-refresh projects data every second
  const { projects: allProjects } = useAutoRefreshAnalytics();
  
  // Initialize from auto-refreshed data
  const [projects, setProjects] = useState(allProjects);
  
  useEffect(() => {
    setProjects(allProjects);
  }, [allProjects]);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("allProjects", JSON.stringify(projects));
  }, [projects]);

  const [selectedProject, setSelectedProject] = useState(() => {
    const stored = localStorage.getItem("allProjects");
    const projectsData = stored ? JSON.parse(stored) : initialProjects;
    return projectsData.length > 0 ? projectsData[0].id : "";
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  const project = projects.find((p) => p.id === selectedProject);

  if (!project) return null;


  const flaggedMilestones = project.milestones.filter((m) => m.flagged);
  const completedMilestones = project.milestones.filter((m) => m.status === "completed");
  const pendingMilestones = project.milestones.filter((m) => m.status === "pending");
  const inProgressMilestones = project.milestones.filter((m) => m.status === "in-progress");

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "in-progress":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "pending":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const handleAddMilestone = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = (data: Record<string, any>) => {
    const newMilestone: Milestone = {
      id: `M${Date.now()}`,
      projectId: selectedProject,
      name: data.name,
      description: data.description || "",
      status: data.status || "pending",
      dayNumber: parseInt(data.dayNumber) || 0,
      dueDate: data.dueDate,
      deliverables: data.deliverables ? data.deliverables.split(",").map((d: string) => d.trim()) : [],
      tasks: [],
      reminders: [],
      flagged: false,
      flagReason: "",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setProjects(
      projects.map((p) =>
        p.id === selectedProject
          ? { ...p, milestones: [...p.milestones, newMilestone] }
          : p
      )
    );
    logActivity({
      type: "add",
      entity: "milestone",
      title: data.name,
      description: `Milestone created - Status: ${data.status || "pending"}`,
      user: "HR Admin",
    });
    setShowAddModal(false);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowEditModal(true);
  };

  const handleEditSubmit = (data: Record<string, any>) => {
    if (selectedMilestone) {
      setProjects(
        projects.map((p) =>
          p.id === selectedProject
            ? {
                ...p,
                milestones: p.milestones.map((m) =>
                  m.id === selectedMilestone.id
                    ? {
                        ...m,
                        name: data.name,
                        description: data.description || m.description,
                        status: data.status,
                        dueDate: data.dueDate,
                      }
                    : m
                ),
              }
            : p
        )
      );
      logActivity({
        type: "edit",
        entity: "milestone",
        title: data.name,
        description: `Milestone updated - Status: ${data.status}`,
        user: "HR Admin",
      });
      setShowEditModal(false);
      setSelectedMilestone(null);
    }
  };

  const handleDeleteMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedMilestone) {
      setProjects(
        projects.map((p) =>
          p.id === selectedProject
            ? {
                ...p,
                milestones: p.milestones.filter((m) => m.id !== selectedMilestone.id),
              }
            : p
        )
      );
      logActivity({
        type: "delete",
        entity: "milestone",
        title: selectedMilestone.name,
        description: `Milestone deleted`,
        user: "HR Admin",
      });
      setShowDeleteConfirm(false);
      setSelectedMilestone(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Project Milestones
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Track project phases and deliverables</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Project Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Client</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">{project.clientName}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Start Date</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {new Date(project.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {new Date(project.startDate).getFullYear()}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500/20" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Budget</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                    ₹{(project.budget || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>


          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase">Completed</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{completedMilestones.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase">In Progress</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{inProgressMilestones.length}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-500/30" />
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase">Pending</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{pendingMilestones.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500/30" />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 dark:text-red-400 text-xs font-semibold uppercase">Flagged</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{flaggedMilestones.length}</p>
                </div>
                <Flag className="w-8 h-8 text-red-500/30" />
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {flaggedMilestones.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Active Alerts</h3>
                  <div className="mt-2 space-y-2">
                    {flaggedMilestones.map((milestone) => (
                      <div key={milestone.id} className="text-sm text-red-800 dark:text-red-200">
                        <p className="font-medium">{milestone.name}</p>
                        {milestone.flagReason && <p className="text-red-700 dark:text-red-300">{milestone.flagReason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Milestone Timeline</h2>
              {isAdmin && (
                <button
                  onClick={handleAddMilestone}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </button>
              )}
            </div>

            {project.milestones.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">No milestones defined for this project</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Milestone</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">Timeline</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Deliverables</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Status</th>
                        {isAdmin && <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 w-20">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {project.milestones
                        .sort((a, b) => a.dayNumber - b.dayNumber)
                        .map((milestone, index) => {
                          const dayText = milestone.dayNumber === 0 ? "Day 0" : `Day ${milestone.dayNumber}`;
                          const delivCount = milestone.deliverables?.length || 0;

                          return (
                            <tr
                              key={milestone.id}
                              className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {milestone.status === "completed" ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-500">
                                      {index + 1}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{milestone.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{milestone.description}</p>
                                  </div>
                                  {milestone.flagged && <Flag className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                </div>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{dayText}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                  {new Date(milestone.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                </span>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                {delivCount > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                                    {delivCount} {delivCount === 1 ? "item" : "items"}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant="outline"
                                  className={`${getMilestoneStatusColor(milestone.status)} border text-xs`}
                                >
                                  {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1).replace("-", " ")}
                                </Badge>
                              </td>
                              {isAdmin && (
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleEditMilestone(milestone)}
                                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors text-slate-500 dark:text-slate-400"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMilestone(milestone)}
                                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors text-slate-500 dark:text-slate-400"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
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
            )}
          </div>
        </div>
      </div>

      {/* Add Milestone Modal */}
      <Modal title="Add Milestone" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <Form
          fields={[
            { name: "name", label: "Milestone Name", type: "text", placeholder: "Enter milestone name", required: true },
            { name: "description", label: "Description", type: "text", placeholder: "Enter description" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "pending", label: "Pending" },
                { value: "in-progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
              ],
              required: true,
            },
            { name: "dayNumber", label: "Day Number", type: "text", placeholder: "0", required: true },
            { name: "dueDate", label: "Due Date", type: "text", placeholder: "YYYY-MM-DD", required: true },
            { name: "deliverables", label: "Deliverables (comma-separated)", type: "text", placeholder: "e.g., Design done, Code review" },
          ]}
          onSubmit={handleAddSubmit}
          submitLabel="Add Milestone"
        />
      </Modal>

      {/* Edit Milestone Modal */}
      <Modal title="Edit Milestone" isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        {selectedMilestone && (
          <Form
            fields={[
              { name: "name", label: "Milestone Name", type: "text", placeholder: "Enter milestone name", required: true },
              { name: "description", label: "Description", type: "text", placeholder: "Enter description" },
              {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                  { value: "pending", label: "Pending" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                ],
                required: true,
              },
              { name: "dueDate", label: "Due Date", type: "text", placeholder: "YYYY-MM-DD", required: true },
            ]}
            initialData={selectedMilestone}
            onSubmit={handleEditSubmit}
            submitLabel="Update Milestone"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal title="Delete Milestone" isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <strong>{selectedMilestone?.name}</strong>? This action cannot be undone.
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
