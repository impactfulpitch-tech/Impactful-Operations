import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";
import { statusConfig, Department } from "@/data/mockData";
import { useTeamStats } from "@/hooks/useTeamStats";
import { PageHeader } from "@/components/PageHeader";
import { AddAdminButton } from "@/components/AddAdminButton";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { StatGrid } from "@/components/StatGrid";
import { Search, Users, AlertTriangle, CheckCircle2, Mail, MessageSquare, Edit2, Trash2 } from "lucide-react";
import { logActivity } from "@/hooks/useActivityLog";

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  department: Department;
  avatar: string;
  taskCount: number;
}

export default function Team() {
  const { user } = useAuth();
  const isAdmin = user?.type === "admin";
  
  // Auto-refresh team and tasks data every second
  const { teamMembers: allTeamMembers, tasks: allTasks } = useAutoRefreshAnalytics();

  // Initialize from auto-refreshed data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(allTeamMembers);
  const [tasks, setTasks] = useState(allTasks);

  useEffect(() => {
    setTeamMembers(allTeamMembers);
  }, [allTeamMembers]);

  useEffect(() => {
    setTasks(allTasks);
  }, [allTasks]);

  // Save team members to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("allTeamMembers", JSON.stringify(teamMembers));
  }, [teamMembers]);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { membersData, totalActive, totalDone, totalOverdue, heavyLoad } = useTeamStats(teamMembers, tasks);

  const departments = [...new Set(teamMembers.map((m) => m.department))];

  const filtered = membersData.filter(({ member }) => {
    if (filterDept !== "all" && member.department !== filterDept) return false;
    if (search && !member.name.toLowerCase().includes(search.toLowerCase()) && !member.role.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleAddMember = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = (data: Record<string, any>) => {
    const newMember: TeamMember = {
      id: `TM${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      avatar: data.name.split(" ").map(n => n[0]).join("").toUpperCase(),
      taskCount: 0,
    };
    setTeamMembers([...teamMembers, newMember]);
    logActivity({
      type: "add",
      entity: "team",
      title: data.name,
      description: `Team member added - Role: ${data.role}, Department: ${data.department}`,
      user: "HR Admin",
    });
    setShowAddModal(false);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleEditSubmit = (data: Record<string, any>) => {
    if (selectedMember) {
      setTeamMembers(
        teamMembers.map((m) =>
          m.id === selectedMember.id
            ? { ...m, name: data.name, email: data.email, role: data.role, department: data.department }
            : m
        )
      );
      logActivity({
        type: "edit",
        entity: "team",
        title: data.name,
        description: `Team member updated - Role: ${data.role}, Department: ${data.department}`,
        user: "HR Admin",
      });
      setShowEditModal(false);
      setSelectedMember(null);
    }
  };

  const handleDeleteMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedMember) {
      setTeamMembers(teamMembers.filter((m) => m.id !== selectedMember.id));
      logActivity({
        type: "delete",
        entity: "team",
        title: selectedMember.name,
        description: `Team member deleted from ${selectedMember.department}`,
        user: "HR Admin",
      });
      setShowDeleteConfirm(false);
      setSelectedMember(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <PageHeader 
        title="Team" 
        subtitle={`Workload overview · ${filtered.length} members`} 
        icon={<Users className="w-4.5 h-4.5 text-accent-foreground" />}
        action={<AddAdminButton label="Member" onClick={handleAddMember} isAdmin={isAdmin} />}
      />

      {/* Quick Stats */}
      <StatGrid
        stats={[
          { label: "Active Tasks", value: totalActive, icon: <Users className="w-4 h-4 text-primary" />, color: "primary" },
          { label: "Completed", value: totalDone, icon: <CheckCircle2 className="w-4 h-4 text-status-done" />, color: "status-done" },
          { label: "Overdue", value: totalOverdue, icon: <AlertTriangle className="w-4 h-4 text-status-blocked" />, color: "status-blocked" },
          { label: "Overloaded", value: heavyLoad, icon: <Users className="w-4 h-4 text-status-review" />, color: "status-review" },
        ]}
        columns={4}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member..."
            className="pl-8 pr-3 py-1.5 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-52"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-[10px] sm:text-xs font-medium text-muted-foreground px-2 sm:px-4 py-2 sm:py-3 w-8">#</th>
                <th className="text-left text-[10px] sm:text-xs font-medium text-muted-foreground px-2 sm:px-4 py-2 sm:py-3">Member</th>
                <th className="text-left text-[10px] sm:text-xs font-medium text-muted-foreground px-2 sm:px-4 py-2 sm:py-3">Department</th>
                <th className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground px-2 sm:px-4 py-2 sm:py-3">Active</th>
                <th className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground px-2 sm:px-4 py-2 sm:py-3">Done</th>
                <th className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground px-2 sm:px-4 py-2 sm:py-3">Overdue</th>
                <th className="text-left text-[10px] sm:text-xs font-medium text-muted-foreground px-2 sm:px-4 py-2 sm:py-3">Workload</th>
                {isAdmin && <th className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground px-2 sm:px-4 py-2 sm:py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ member, memberTasks, active, done, overdue, load }, index) => (
                <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <span className="text-[11px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{index + 1}</span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
                        {member.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-card-foreground text-xs sm:text-sm truncate">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap">{member.department}</span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-card-foreground text-xs sm:text-sm">{active}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-status-done text-xs sm:text-sm">{done}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">
                    {overdue > 0 ? <span className="text-status-blocked">{overdue}</span> : <span className="text-muted-foreground">0</span>}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[50px] sm:max-w-[60px]">
                        <div
                          className={`h-full rounded-full ${load === "high" ? "bg-status-blocked" : load === "medium" ? "bg-status-review" : "bg-status-done"}`}
                          style={{ width: `${Math.min((active / 6) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-medium whitespace-nowrap ${load === "high" ? "text-status-blocked" : load === "medium" ? "text-status-review" : "text-status-done"}`}>
                        {load === "high" ? "Heavy" : load === "medium" ? "Busy" : "Light"}
                      </span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground hover:text-primary"
                          title="Edit member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member)}
                          className="p-1.5 hover:bg-status-blocked/10 hover:text-status-blocked rounded-lg transition-colors text-muted-foreground hover:text-status-blocked"
                          title="Delete member"
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
      </div>

      {/* Add Member Modal */}
      <Modal title="Add Team Member" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <Form
          fields={[
            { name: "name", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
            { name: "email", label: "Email", type: "email", placeholder: "john@company.com", required: true },
            { name: "role", label: "Role", type: "text", placeholder: "Senior Designer", required: true },
            {
              name: "department",
              label: "Department",
              type: "select",
              options: departments.map((d) => ({ value: d, label: d })),
              required: true,
            },
          ]}
          onSubmit={handleAddSubmit}
          submitLabel="Add Member"
        />
      </Modal>

      {/* Edit Member Modal */}
      <Modal title="Edit Team Member" isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        {selectedMember && (
          <Form
            fields={[
              { name: "name", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
              { name: "email", label: "Email", type: "email", placeholder: "john@company.com", required: true },
              { name: "role", label: "Role", type: "text", placeholder: "Senior Designer", required: true },
              {
                name: "department",
                label: "Department",
                type: "select",
                options: departments.map((d) => ({ value: d, label: d })),
                required: true,
              },
            ]}
            initialData={selectedMember}
            onSubmit={handleEditSubmit}
            submitLabel="Update Member"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal title="Delete Member" isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{selectedMember?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2 bg-status-blocked text-white rounded-lg font-medium hover:bg-status-blocked/90 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
