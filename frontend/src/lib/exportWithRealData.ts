import * as XLSX from "xlsx";

/**
 * Export full report with all REAL data from current state
 */
export function exportFullReportToExcel(tasks: any[], teamMembers: any[], projects: any[], filename = "Full_Report") {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    { Metric: "Total Tasks", Value: tasks.length },
    { Metric: "Completed Tasks", Value: tasks.filter(t => t.status === "done" || t.status === "completed").length },
    { Metric: "In Progress Tasks", Value: tasks.filter(t => t.status === "in-progress").length },
    { Metric: "Blocked Tasks", Value: tasks.filter(t => t.status === "blocked" || t.status === "waiting").length },
    { Metric: "Team Members", Value: teamMembers.length },
    { Metric: "Active Projects", Value: projects.length },
    { Metric: "Report Generated", Value: new Date().toLocaleString("en-IN") },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Sheet 2: Tasks (REAL DATA)
  const tasksData = tasks.map(task => ({
    "Task ID": task.id,
    "Title": task.title,
    "Project": task.project || "N/A",
    "Status": task.status,
    "Priority": task.priority || "medium",
    "Assignee": task.assignee?.name || "Unassigned",
    "Department": task.department || "General",
    "Start Date": task.startDate ? new Date(task.startDate).toLocaleDateString("en-IN") : "N/A",
    "Due Date": task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-IN") : "N/A",
    "Description": task.description || "",
  }));
  const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
  tasksSheet["!cols"] = [
    { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 12 },
    { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 12 },
    { wch: 12 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(workbook, tasksSheet, "Tasks");

  // Sheet 3: Team (REAL DATA)
  const teamData = teamMembers.map(member => ({
    "Name": member.name || "Unknown",
    "Role": member.role || "N/A",
    "Department": member.department || "General",
    "Tasks Assigned": member.taskCount || 0,
  }));
  const teamSheet = XLSX.utils.json_to_sheet(teamData);
  teamSheet["!cols"] = [{ wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, teamSheet, "Team");

  // Sheet 4: Projects (REAL DATA)
  const projectsData = projects.map(proj => ({
    "Project ID": proj.id || "N/A",
    "Project Name": proj.name || "N/A",
    "Client": proj.clientName || "Internal",
    "Status": proj.status || "N/A",
    "Budget": proj.budget || 0,
    "Start Date": proj.startDate ? new Date(proj.startDate).toLocaleDateString("en-IN") : "N/A",
    "End Date": proj.endDate ? new Date(proj.endDate).toLocaleDateString("en-IN") : "N/A",
    "Milestones": proj.milestones?.length || 0,
  }));
  const projectsSheet = XLSX.utils.json_to_sheet(projectsData);
  projectsSheet["!cols"] = [
    { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 12 },
    { wch: 12 }, { wch: 13 }, { wch: 13 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, projectsSheet, "Projects");

  // Sheet 5: Departments
  const deptMap = new Map<string, number>();
  tasks.forEach(task => {
    const dept = task.department || "General";
    deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
  });
  const deptData = Array.from(deptMap).map(([dept, count]) => ({
    "Department": dept,
    "Total Tasks": count,
    "Completed": tasks.filter(t => t.department === dept && (t.status === "done" || t.status === "completed")).length,
    "In Progress": tasks.filter(t => t.department === dept && t.status === "in-progress").length,
  }));
  const deptSheet = XLSX.utils.json_to_sheet(deptData);
  deptSheet["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, deptSheet, "Departments");

  // Write file with today's date
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * Export only tasks with REAL data
 */
export function exportTasksRealDataToExcel(tasks: any[], filename = "Tasks_Report") {
  const data = tasks.map(task => ({
    "ID": task.id,
    "Title": task.title,
    "Description": task.description || "",
    "Project": task.project || "N/A",
    "Status": task.status,
    "Priority": task.priority || "medium",
    "Assignee": task.assignee?.name || "Unassigned",
    "Department": task.department || "General",
    "Start": task.startDate ? new Date(task.startDate).toLocaleDateString("en-IN") : "N/A",
    "Due": task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-IN") : "N/A",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 20 },
    { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 15 },
    { wch: 12 }, { wch: 12 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * Export team members with REAL data
 */
export function exportTeamRealDataToExcel(teamMembers: any[], tasks: any[], filename = "Team_Report") {
  const data = teamMembers.map(member => {
    const memberTasks = tasks.filter(t => t.assignee?.name === member.name);
    return {
      "Name": member.name || "Unknown",
      "Role": member.role || "N/A",
      "Department": member.department || "General",
      "Total Tasks": memberTasks.length,
      "Completed": memberTasks.filter(t => t.status === "done" || t.status === "completed").length,
      "In Progress": memberTasks.filter(t => t.status === "in-progress").length,
      "Blocked": memberTasks.filter(t => t.status === "blocked" || t.status === "waiting").length,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Team");
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}
