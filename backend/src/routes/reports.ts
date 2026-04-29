import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from './auth';

const router = Router();

// Sample HR Reports Data
const reportSheets = [
  {
    id: "monthly",
    name: "Monthly Reports",
    description: "Individual employee monthly performance reports",
    createdDate: "2024-04-01",
    records: [
      { id: 1, name: "John Doe", department: "Engineering", date: "2024-04-01", status: "Completed", amount: 5000, details: "Monthly tasks completed", category: "report", remarks: "On time", action: "Approved" },
      { id: 2, name: "Sarah Smith", department: "Marketing", date: "2024-04-01", status: "Completed", amount: 4500, details: "Campaign management", category: "report", remarks: "Excellent performance", action: "Approved" },
      { id: 3, name: "Mike Johnson", department: "Sales", date: "2024-04-01", status: "In Progress", amount: 3500, details: "Quarterly targets", category: "report", remarks: "On track", action: "In Review" },
      { id: 4, name: "Emily Davis", department: "HR", date: "2024-04-01", status: "Completed", amount: 4000, details: "Recruitment activities", category: "report", remarks: "Good progress", action: "Approved" },
      { id: 5, name: "Alex Wilson", department: "Finance", date: "2024-04-01", status: "Completed", amount: 5500, details: "Budget analysis", category: "report", remarks: "Accurate reporting", action: "Approved" },
    ]
  },
  {
    id: "department",
    name: "Department Reports",
    description: "Department-wise metrics and team information",
    createdDate: "2024-04-01",
    records: [
      { id: 1, name: "Engineering", department: "Department", date: "2024-04-01", status: "Active", amount: 8, details: "8 team members", category: "department", remarks: "Fully staffed", action: "Monitor" },
      { id: 2, name: "Marketing", department: "Department", date: "2024-04-01", status: "Active", amount: 5, details: "5 team members", category: "department", remarks: "Campaign ongoing", action: "Monitor" },
      { id: 3, name: "Sales", department: "Department", date: "2024-04-01", status: "Active", amount: 6, details: "6 team members", category: "department", remarks: "Q1 targets met", action: "Monitor" },
      { id: 4, name: "HR", department: "Department", date: "2024-04-01", status: "Active", amount: 4, details: "4 team members", category: "department", remarks: "Recruitment open", action: "Monitor" },
      { id: 5, name: "Finance", department: "Department", date: "2024-04-01", status: "Active", amount: 3, details: "3 team members", category: "department", remarks: "Audit complete", action: "Monitor" },
    ]
  },
  {
    id: "performance",
    name: "Performance Reports",
    description: "Performance metrics and KPI tracking",
    createdDate: "2024-04-01",
    records: [
      { id: 1, name: "Q1 Performance", department: "Overall", date: "2024-03-31", status: "Completed", amount: 92, details: "Organization achieved 92% KPI targets", category: "performance", remarks: "Exceeding targets", action: "Reviewed" },
      { id: 2, name: "Employee Engagement", department: "HR", date: "2024-04-01", status: "Completed", amount: 88, details: "88% engagement score", category: "performance", remarks: "Strong culture", action: "Reviewed" },
      { id: 3, name: "Project Delivery", department: "Engineering", date: "2024-04-01", status: "Completed", amount: 95, details: "95% on-time delivery", category: "performance", remarks: "Excellent", action: "Reviewed" },
      { id: 4, name: "Sales Performance", department: "Sales", date: "2024-04-01", status: "In Progress", amount: 85, details: "85% of quota achieved", category: "performance", remarks: "Good progress", action: "In Review" },
    ]
  },
  {
    id: "archived",
    name: "Archived Reports",
    description: "Previous reports and archived data",
    createdDate: "2024-04-01",
    records: [
      { id: 1, name: "Q4 2023 Report", department: "Overall", date: "2023-12-31", status: "Archived", amount: 89, details: "Year-end performance", category: "archived", remarks: "Completed", action: "Archived" },
      { id: 2, name: "2023 Annual Review", department: "HR", date: "2023-12-31", status: "Archived", amount: 0, details: "Annual employee review", category: "archived", remarks: "Completed", action: "Archived" },
    ]
  }
];

// Get all report sheets
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    res.json(reportSheets);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report sheet
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const report = reportSheets.find(r => r.id === id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Get all records from all reports
router.get('/records/all', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const allRecords = reportSheets.flatMap(sheet => 
      sheet.records.map(record => ({
        ...record,
        sheetId: sheet.id,
        sheetName: sheet.name
      }))
    );

    res.json(allRecords);
  } catch (error) {
    console.error('Error fetching all records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

export default router;
