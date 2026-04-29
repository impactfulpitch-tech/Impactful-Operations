import { useState } from "react";
import { BarChart3, RefreshCw, DollarSign, ShoppingCart, Users, TrendingUp, Download, FileText, Search, Filter } from "lucide-react";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";
import { exportFullReportToExcel, exportTasksRealDataToExcel, exportTeamRealDataToExcel } from "@/lib/exportWithRealData";
import { reportSheets, ReportRecord } from "@/data/reportsData";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

function getStatusColor(status: string): string {
  if (!status) return "bg-gray-100 text-gray-800";
  const s = status.toLowerCase();
  if (s.includes("completed") || s.includes("approved")) return "bg-green-200 text-green-900 font-semibold";
  if (s.includes("archived")) return "bg-gray-200 text-gray-900 font-semibold";
  if (s.includes("in progress") || s.includes("in review")) return "bg-blue-200 text-blue-900 font-semibold";
  if (s.includes("active")) return "bg-emerald-200 text-emerald-900 font-semibold";
  return "bg-gray-200 text-gray-800";
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeReportSheet, setActiveReportSheet] = useState("monthly");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchReport, setSearchReport] = useState("");
  const [filterReportCat, setFilterReportCat] = useState("all");

  // Auto-refresh all analytics data every second
  const { tasks, teamMembers, projects } = useAutoRefreshAnalytics();

  // Calculate stats from REAL data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done" || t.status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;
  const blockedTasks = tasks.filter(t => t.status === "blocked" || t.status === "waiting").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status data for pie chart (from real data)
  const statusData = [
    { name: "Completed", value: completedTasks, color: "#10b981" },
    { name: "In Progress", value: inProgressTasks, color: "#3b82f6" },
    { name: "Blocked/Waiting", value: blockedTasks, color: "#ef4444" },
  ];

  // Department data from projects (from real data)
  const deptData = projects.map((proj: any) => {
    const projTasks = tasks.filter((t: any) => t.project === proj.name || t.project === proj);
    return {
      name: typeof proj === "string" ? proj.substring(0, 12) : proj.name?.substring(0, 12) || "Unknown",
      completed: projTasks.filter((t: any) => t.status === "done" || t.status === "completed").length,
      pending: projTasks.filter((t: any) => t.status !== "done" && t.status !== "completed").length,
    };
  });

  // Team workload data
  const teamWorkload = teamMembers.map((member: any) => {
    const memberTasks = tasks.filter((t: any) => 
      t.assignee?.name === member.name || t.assignee?.id === member.id
    );
    return {
      name: member.name || member.avatar || "Unknown",
      tasks: memberTasks.length,
      completed: memberTasks.filter((t: any) => t.status === "done" || t.status === "completed").length,
    };
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Data auto-refreshes every second via useAutoRefreshAnalytics
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const tabs = [
    { id: "overview", label: "Analytics Dashboard", icon: "📊" },
    { id: "projects", label: "Projects", icon: "📁" },
    { id: "tasks", label: "Task Analytics", icon: "✓" },
    { id: "reports", label: "HR Reports", icon: "📋" },
  ];

  // Get current report sheet
  const currentReportSheet = reportSheets.find((s) => s.id === activeReportSheet);
  const reportRecords = currentReportSheet?.records || [];

  // Filter report data
  const filteredReports = reportRecords.filter((r) => {
    if (filterReportCat !== "all" && r.category !== filterReportCat) return false;
    if (searchReport && !r.name.toLowerCase().includes(searchReport.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Real-time tasks, team performance, and project insights
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                🔄 Auto-refreshes every 30 seconds | Last update: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              {/* Export Buttons */}
              <button
                onClick={() => exportFullReportToExcel(tasks, teamMembers, projects)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 rounded-lg text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
              >
                <Download className="w-4 h-4" />
                Full Report
              </button>
              <button
                onClick={() => exportTasksRealDataToExcel(tasks)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-700 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all"
              >
                <Download className="w-4 h-4" />
                Tasks
              </button>
              <button
                onClick={() => exportTeamRealDataToExcel(teamMembers, tasks)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 dark:bg-amber-700 rounded-lg text-sm font-medium text-white hover:bg-amber-700 dark:hover:bg-amber-600 transition-all"
              >
                <Download className="w-4 h-4" />
                Team
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Tasks */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              ↑ +12.5% from last week
            </p>
          </div>

          {/* Completed */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Completed</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{completedTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ↑ +8.2% completion rate
            </p>
          </div>

          {/* In Progress */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{inProgressTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ↑ +12.5% activity
            </p>
          </div>

          {/* Blocked/Overdue */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Blocked/Overdue</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{blockedTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              ↑ +24.1% concerns
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 font-medium text-sm transition-colors relative ${
                  activeTab === tab.id
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.icon} {tab.label}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Task Status Distribution</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Current task status breakdown</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {statusData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Completion Rate</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Overall project progress</p>
              <div className="flex flex-col items-center justify-center h-64">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full border-8 border-slate-200 dark:border-slate-700" />
                  <div
                    className="absolute w-32 h-32 rounded-full border-8 border-transparent border-t-blue-600 border-r-blue-600"
                    style={{
                      borderTopColor: "#3b82f6",
                      borderRightColor: "#3b82f6",
                      transform: `rotate(${(completionRate / 100) * 360}deg)`,
                    }}
                  />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">
                      {completionRate}%
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Complete
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {activeTab === "projects" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department/Project Performance */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Project Performance</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Tasks completed vs. pending by project</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Team Workload */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Team Workload</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Tasks per team member</p>
              {teamWorkload.length > 0 ? (
                <div className="space-y-4">
                  {teamWorkload.map((member, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {member.completed}/{member.tasks}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${member.tasks > 0 ? (member.completed / member.tasks) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-500">
                  <p>No team members data</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Task Metrics</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Key performance indicators</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Tasks</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Completed Rate</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Active Tasks</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">At Risk</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{blockedTasks}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Quick Insights</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Performance summary</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📈</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Tasks are on track with {completionRate}% completion rate
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">👥</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {teamMembers.length} team members actively contributing
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {blockedTasks} tasks need immediate attention
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HR REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Report Data Display */}
            {currentReportSheet && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {currentReportSheet.name} - Report Data
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {currentReportSheet.description} ({filteredReports.length} records)
                  </p>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchReport}
                        onChange={(e) => setSearchReport(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <select
                        value={filterReportCat}
                        onChange={(e) => setFilterReportCat(e.target.value)}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="report">Reports</option>
                        <option value="department">Departments</option>
                        <option value="performance">Performance</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Report Table */}
                {filteredReports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Department</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                          {filteredReports[0]?.amount !== undefined && (
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                          )}
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Remarks</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((record: ReportRecord, idx) => (
                          <tr key={idx} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-medium text-slate-900 dark:text-white">{record.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600 dark:text-slate-400">{record.department}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600 dark:text-slate-400">{record.date}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                            </td>
                            {record.amount !== undefined && (
                              <td className="px-4 py-3">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {typeof record.amount === 'number' && record.amount > 100 
                                    ? `₹${record.amount.toLocaleString('en-IN')}` 
                                    : record.amount}
                                </span>
                              </td>
                            )}
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600 dark:text-slate-400">{record.remarks || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600 dark:text-slate-400">{record.action || '-'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400">No records found</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
