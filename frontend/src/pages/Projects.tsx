import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";
import { useProjectReminders } from "@/hooks/useProjectReminders";
import { useProjectLocks } from "@/hooks/useProjectLocks";
import { PageHeader } from "@/components/PageHeader";
import { AddAdminButton } from "@/components/AddAdminButton";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { ProjectDetailModal } from "@/components/ProjectDetailModal";
import { FolderKanban, X, Calendar, AlertCircle, CheckCircle, Lock, Link2, Paperclip, ExternalLink } from "lucide-react";
import { logActivity } from "@/hooks/useActivityLog";

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.type === "admin";

  // Auto-refresh projects data every second
  const { projects: allProjects } = useAutoRefreshAnalytics();
  
  // Initialize from auto-refreshed data
  const [projects, setProjects] = useState<Project[]>(allProjects);
  
  useEffect(() => {
    setProjects(allProjects);
  }, [allProjects]);

  const [showLinksModal, setShowLinksModal] = useState(false);
  const [selectedProjectForLinks, setSelectedProjectForLinks] = useState<Project | null>(null);

  // Helper function to get all links for a project
  const getProjectLinks = (projectId: string) => {
    const storedLinks = localStorage.getItem(`projectLinks_${projectId}`);
    if (!storedLinks) return [];
    return JSON.parse(storedLinks);
  };

  // Helper function to get ChatGPT links for a project
  const getChatGPTLinks = (projectId: string) => {
    const storedLinks = localStorage.getItem(`projectLinks_${projectId}`);
    if (!storedLinks) return [];
    const links = JSON.parse(storedLinks);
    return links.filter((link: any) => link.category === 'chatgpt');
  };

  // Use project reminders hook
  useProjectReminders();

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("allProjects", JSON.stringify(projects));
  }, [projects]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed" | "on-hold">("all");

  // Filter projects
  const filtered = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Helper function to get days elapsed since project start
  const getDaysElapsed = (startDate: string) => {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  // Helper function to check if content is locked (after 10 days)
  const isContentLocked = (daysElapsed: number) => daysElapsed >= 10;

  // Helper function to check if payments are locked (after 10 days)
  const isFinancialLocked = (daysElapsed: number) => daysElapsed >= 10;

  // Helper function to check if payment reminder should show (5 days)
  const shouldShowPaymentReminder = (daysElapsed: number, reminderSent: boolean) => {
    return daysElapsed >= 5 && !reminderSent;
  };

  const handleAddProject = () => {
    setShowAddModal(true);
  };

  const handleAddProjectSubmit = (data: Record<string, any>) => {
    if (!data.startDate || !data.endDate) {
      alert("Please set both start and end dates");
      return;
    }

    const endDate = new Date(data.endDate);
    const reminderDate = new Date(endDate.getTime() - 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const newProject: Project = {
      id: `P${Date.now()}`,
      name: data.projectName,
      clientName: data.clientName || "Internal",
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || "active",
      budget: data.budget ? parseInt(data.budget) : undefined,
      timeline: data.timeline,
      reminderDate: reminderDate,
      description: data.description || "",
      milestones: [],
      projectLinks: [],
      contentLocked: false,
      financialLocked: false,
      paymentReminderSentAt5Days: false,
    };

    setProjects([...projects, newProject]);
    logActivity({
      type: "add",
      entity: "project",
      title: data.projectName,
      description: `Project created: ${data.startDate} to ${data.endDate}. Timeline: ${data.timeline}. Reminder: ${reminderDate}`,
      user: "HR Admin",
    });
    setShowAddModal(false);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (selectedProject) {
      setProjects(projects.filter((p) => p.id !== selectedProject.id));
      logActivity({
        type: "delete",
        entity: "project",
        title: selectedProject.name,
        description: `Project deleted`,
        user: "HR Admin",
      });
      setShowDeleteConfirm(false);
      setSelectedProject(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200";
      case "completed":
        return "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200";
      case "on-hold":
        return "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title="Projects"
          subtitle={`${filtered.length} projects`}
          icon={<FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          action={<AddAdminButton label="Project" onClick={handleAddProject} isAdmin={isAdmin} />}
        />

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => {
              const daysRemaining = getDaysRemaining(project.endDate || "");
              const isOverdue = daysRemaining < 0;
              const isNearDeadline = daysRemaining <= 15 && daysRemaining > 0;
              const daysElapsed = getDaysElapsed(project.startDate);
              const contentLocked = isContentLocked(daysElapsed);
              const financialLocked = isFinancialLocked(daysElapsed);
              const showPaymentReminder = shouldShowPaymentReminder(daysElapsed, project.paymentReminderSentAt5Days);

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        {project.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {project.clientName}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-950 text-red-600 dark:text-red-400 rounded transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Lock Status Badges */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {showPaymentReminder && (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        💳 Payment Reminder
                      </span>
                    )}
                    {contentLocked && (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                        <Lock size={12} /> Content Locked
                      </span>
                    )}
                    {financialLocked && (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                        <Lock size={12} /> Financial Locked
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.replace("-", " ").toUpperCase()}
                    </span>
                  </div>

                  {/* Timeline Info */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatDate(project.startDate)} → {formatDate(project.endDate || "")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Days elapsed:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{daysElapsed}</span>
                    </div>

                    {project.timeline && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {project.timeline}
                        </span>
                      </div>
                    )}

                    {/* Days Remaining */}
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isOverdue
                          ? "text-red-600 dark:text-red-400"
                          : isNearDeadline
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {isOverdue ? (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>{Math.abs(daysRemaining)} days overdue</span>
                        </>
                      ) : isNearDeadline ? (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>{daysRemaining} days remaining</span>
                        </>
                      ) : project.status === "completed" ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>{daysRemaining} days remaining</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Reminder Info */}
                  {project.reminderDate && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded text-sm mb-4">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-700 dark:text-blue-300">
                        Reminder set for {formatDate(project.reminderDate)} (15 days before)
                      </span>
                    </div>
                  )}

                  {/* Budget */}
                  {project.budget && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Budget: <span className="font-bold text-slate-900 dark:text-white">₹{project.budget.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 flex-wrap">
                    {/* Links Button */}
                    <button
                      onClick={() => {
                        setSelectedProjectForLinks(project);
                        setShowLinksModal(true);
                      }}
                      className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1 text-sm"
                      title={`View all links for this project`}
                    >
                      <Paperclip size={16} />
                      Links ({getProjectLinks(project.id).length})
                    </button>

                    {/* ChatGPT Quick Access */}
                    {getChatGPTLinks(project.id).length > 0 && (
                      <a
                        href={getChatGPTLinks(project.id)[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1 text-sm"
                        title="Open ChatGPT conversation for this project"
                      >
                        🤖 ChatGPT
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowDetailModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Link2 size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No projects found</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              {isAdmin ? "Create a new project to get started" : "No projects available"}
            </p>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <Modal title="Add New Project" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <Form
          fields={[
            {
              name: "projectName",
              label: "Project Name",
              type: "text",
              placeholder: "Enter project name",
              required: true,
            },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              placeholder: "Project description (optional)",
            },
            {
              name: "clientName",
              label: "Client Name",
              type: "text",
              placeholder: "Client or department name",
              required: true,
            },
            {
              name: "startDate",
              label: "Start Date",
              type: "date",
              required: true,
            },
            {
              name: "endDate",
              label: "End Date",
              type: "date",
              required: true,
            },
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
                { value: "6 months", label: "6 Months" },
                { value: "1 year", label: "1 Year" },
              ],
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "active", label: "Active" },
                { value: "on-hold", label: "On Hold" },
                { value: "completed", label: "Completed" },
              ],
            },
            {
              name: "budget",
              label: "Budget",
              type: "text",
              placeholder: "Budget amount (optional)",
            },
          ]}
          onSubmit={handleAddProjectSubmit}
          submitLabel="Create Project"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Project"
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <strong>{selectedProject?.name}</strong>? This action
            cannot be undone.
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

      {/* Project Detail Modal with Links */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* Project Links Modal */}
      <Modal
        title={selectedProjectForLinks ? `Links for ${selectedProjectForLinks.name}` : "Project Links"}
        isOpen={showLinksModal}
        onClose={() => {
          setShowLinksModal(false);
          setSelectedProjectForLinks(null);
        }}
      >
        <div className="space-y-4">
          {selectedProjectForLinks && getProjectLinks(selectedProjectForLinks.id).length > 0 ? (
            <div className="space-y-3">
              {getProjectLinks(selectedProjectForLinks.id).map((link: any, index: number) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          link.category === 'chatgpt'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                            : link.category === 'documentation'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : link.category === 'figma'
                            ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
                            : link.category === 'github'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        }`}>
                          {link.category === 'chatgpt' ? '🤖' : 
                           link.category === 'documentation' ? '📚' :
                           link.category === 'figma' ? '🎨' :
                           link.category === 'github' ? '💻' : '🔗'} {link.category.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white break-words">
                        {link.title}
                      </p>
                      {link.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {link.description}
                        </p>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block break-all"
                      >
                        {link.url.length > 50 ? link.url.substring(0, 50) + '...' : link.url}
                      </a>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                      title="Open link"
                    >
                      <ExternalLink size={16} className="text-slate-600 dark:text-slate-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Paperclip className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No links added yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Click "View Details" to add links for this project
              </p>
            </div>
          )}
          {selectedProjectForLinks && (
            <button
              onClick={() => {
                setShowLinksModal(false);
                setSelectedProjectForLinks(null);
                setSelectedProject(selectedProjectForLinks);
                setShowDetailModal(true);
              }}
              className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Add New Link
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
