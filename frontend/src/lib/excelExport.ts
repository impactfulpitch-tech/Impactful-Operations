import * as XLSX from "xlsx";
import { Task, TeamMember } from "@/data/mockData";

export interface ExportData {
  type: "tasks" | "team" | "departments" | "projects" | "full-report";
  data: any[];
  filename: string;
  sheetName: string;
}

/**
 * Export tasks to Excel
 */
export function exportTasksToExcel(tasks: Task[], filename = "Tasks_Report") {
  const data = tasks.map((task) => ({
    "Task ID": task.id,
    "Title": task.title,
    "Project": task.project,
    "Status": task.status.toUpperCase(),
    "Priority": task.priority.toUpperCase(),
    "Assignee": task.assignee.name,
    "Department": task.department,
    "Due Date": new Date(task.dueDate).toLocaleDateString("en-IN"),
    "Start Date": new Date(task.startDate).toLocaleDateString("en-IN"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

  // Style the header
  const headerStyle = {
    font: { bold: true, color: "FFFFFF" },
    fill: { fgColor: { rgb: "4F46E5" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  // Apply header styles
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    worksheet[address].s = headerStyle;
  }

  // Set column widths
  worksheet["!cols"] = [
    { wch: 12 }, // Task ID
    { wch: 25 }, // Title
    { wch: 15 }, // Project
    { wch: 12 }, // Status
    { wch: 12 }, // Priority
    { wch: 18 }, // Assignee
    { wch: 15 }, // Department
    { wch: 13 }, // Due Date
    { wch: 13 }, // Start Date
  ];

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * Export team members to Excel
 */
export function exportTeamToExcel(team: TeamMember[], filename = "Team_Report") {
  const data = team.map((member) => ({
    "Name": member.name,
    "Role": member.role,
    "Department": member.department,
    "Avatar": member.avatar,
    "Task Count": member.taskCount,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Team");

  const headerStyle = {
    font: { bold: true, color: "FFFFFF" },
    fill: { fgColor: { rgb: "4F46E5" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    worksheet[address].s = headerStyle;
  }

  worksheet["!cols"] = [
    { wch: 18 }, // Name
    { wch: 15 }, // Role
    { wch: 15 }, // Department
    { wch: 8 }, // Avatar
    { wch: 12 }, // Task Count
  ];

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * Export department statistics to Excel
 */
export function exportDepartmentStatsToExcel(
  deptData: Array<{ name: string; total: number; done: number; delayed: number; blocked: number }>,
  filename = "Department_Stats"
) {
  const data = deptData.map((d) => ({
    "Department": d.name,
    "Total Tasks": d.total,
    "Completed": d.done,
    "Completion Rate (%)": d.total > 0 ? Math.round((d.done / d.total) * 100) : 0,
    "Delayed": d.delayed,
    "Blocked": d.blocked,
    "On Track": d.total - d.done - d.delayed - d.blocked,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Departments");

  const headerStyle = {
    font: { bold: true, color: "FFFFFF" },
    fill: { fgColor: { rgb: "4F46E5" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    worksheet[address].s = headerStyle;
  }

  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 13 },
    { wch: 12 },
    { wch: 18 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
  ];

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * Export comprehensive report with multiple sheets
 */
export function exportFullReport(
  tasks: Task[],
  team: TeamMember[],
  deptData: Array<{ name: string; total: number; done: number; delayed: number; blocked: number }>,
  projectData: Array<{ name: string; done: number; active: number }>
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const today = new Date().toISOString().split("T")[0];
  const completed = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter((t) => t.dueDate < today && t.status !== "done").length;
  const blocked = tasks.filter((t) => t.status === "blocked" || t.status === "waiting").length;

  const summaryData = [
    { Metric: "Total Tasks", Value: tasks.length },
    { Metric: "Completed", Value: completed },
    { Metric: "Completion Rate (%)", Value: Math.round((completed / tasks.length) * 100) },
    { Metric: "Overdue", Value: overdue },
    { Metric: "Blocked", Value: blocked },
    { Metric: "Team Members", Value: team.length },
    { Metric: "Departments", Value: deptData.length },
    { Metric: "Projects", Value: projectData.length },
    { Metric: "Report Generated", Value: new Date().toLocaleString("en-IN") },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Sheet 2: Tasks
  const tasksData = tasks.map((task) => ({
    "Task ID": task.id,
    "Title": task.title,
    "Project": task.project,
    "Status": task.status.toUpperCase(),
    "Priority": task.priority.toUpperCase(),
    "Assignee": task.assignee.name,
    "Department": task.department,
    "Due Date": new Date(task.dueDate).toLocaleDateString("en-IN"),
  }));

  const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
  XLSX.utils.book_append_sheet(workbook, tasksSheet, "Tasks");

  // Sheet 3: Team
  const teamData = team.map((member) => ({
    "Name": member.name,
    "Role": member.role,
    "Department": member.department,
    "Task Count": member.taskCount,
  }));

  const teamSheet = XLSX.utils.json_to_sheet(teamData);
  XLSX.utils.book_append_sheet(workbook, teamSheet, "Team");

  // Sheet 4: Departments
  const deptSheetData = deptData.map((d) => ({
    "Department": d.name,
    "Total Tasks": d.total,
    "Completed": d.done,
    "Completion Rate (%)": d.total > 0 ? Math.round((d.done / d.total) * 100) : 0,
    "Delayed": d.delayed,
    "Blocked": d.blocked,
  }));

  const deptSheet = XLSX.utils.json_to_sheet(deptSheetData);
  XLSX.utils.book_append_sheet(workbook, deptSheet, "Departments");

  // Sheet 5: Projects
  const projSheetData = projectData.map((p) => ({
    "Project": p.name,
    "Done": p.done,
    "Active": p.active,
    "Total": p.done + p.active,
    "Completion Rate (%)": Math.round((p.done / (p.done + p.active)) * 100),
  }));

  const projSheet = XLSX.utils.json_to_sheet(projSheetData);
  XLSX.utils.book_append_sheet(workbook, projSheet, "Projects");

  // Apply header styles to all sheets
  [summarySheet, tasksSheet, teamSheet, deptSheet, projSheet].forEach((sheet) => {
    const headerStyle = {
      font: { bold: true, color: "FFFFFF" },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (sheet[address]) {
        sheet[address].s = headerStyle;
      }
    }
  });

  XLSX.writeFile(workbook, `Full_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * Export client sheets data to Excel
 */
export function exportClientSheetsToExcel(sheets: any[], activeSheetId: string, filename = "Client_Sheets") {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const data = sheet.records.map((record: any) => ({
      "Name": record.name,
      "Status": record.status,
      "Amount": record.amount,
      "Action": record.action,
      "Category": record.category,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const headerStyle = {
      font: { bold: true, color: "FFFFFF" },
      fill: { fgColor: { rgb: "059669" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (worksheet[address]) {
        worksheet[address].s = headerStyle;
      }
    }

    worksheet["!cols"] = [
      { wch: 20 }, // Name
      { wch: 20 }, // Status
      { wch: 12 }, // Amount
      { wch: 20 }, // Action
      { wch: 15 }, // Category
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.substring(0, 31));
  });

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * Import Excel file and parse client records
 */
export function importClientSheetsFromExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        
        const result: any[] = [];
        let sheetIndex = 0;
        
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const records = XLSX.utils.sheet_to_json(worksheet);
          
          const mappedRecords = records.map((record: any, index: number) => ({
            id: `imported-${Date.now()}-${sheetIndex}-${index}`,
            name: record.Name || record.name || "",
            status: record.Status || record.status || "Initial contact",
            amount: parseInt(record.Amount || record.amount || "0"),
            action: record.Action || record.action || "Follow up",
            category: record.Category || record.category || "client",
            remarks: record.Remarks || record.remarks || "",
            where: record.Where || record.where || "",
            followUp: record.FollowUp || record.followUp || "",
          }));
          
          result.push({
            id: `sheet-${Date.now()}-${sheetIndex}`,
            name: sheetName || `Imported Sheet ${sheetIndex + 1}`,
            records: mappedRecords,
          });
          
          sheetIndex++;
        });
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsBinaryString(file);
  });
}
