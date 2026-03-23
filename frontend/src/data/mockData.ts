export type TaskStatus = "todo" | "in-progress" | "review" | "done" | "blocked" | "waiting";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type Department = "Content" | "Design" | "Finance" | "IB";
export type ReminderType = "urgent" | "warning" | "info" | "success";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: Department;
  avatar: string;
  taskCount: number;
}

export interface Reminder {
  id: string;
  type: ReminderType;
  subject: string;
  message: string;
  dueDate: string;
  priority: "high" | "normal" | "low";
  completed: boolean;
  assignedTo?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: TeamMember;
  department: Department;
  startDate: string;
  dueDate: string;
  timeline?: string;
  reminderDate?: string;
  dependencies: string[];
  blockedReason?: string;
  comments: { author: string; text: string; date: string }[];
  project: string;
}

export const teamMembers: TeamMember[] = [
  { id: "1", name: "Binita Shah", role: "Designer", department: "Design", avatar: "BS", taskCount: 6 },
  { id: "2", name: "Dharmesh", role: "Designer", department: "Design", avatar: "D", taskCount: 5 },
  { id: "3", name: "Sonali", role: "Content Writer", department: "Content", avatar: "S", taskCount: 4 },
  { id: "4", name: "Ithi", role: "Content Specialist", department: "Content", avatar: "I", taskCount: 3 },
  { id: "5", name: "Sagar", role: "Finance Manager", department: "Finance", avatar: "S", taskCount: 4 },
];

export const tasks: Task[] = [
  {
    id: "T-001", title: "Design homepage mockup", description: "Create wireframes and high-fidelity mockup for client homepage",
    status: "in-progress", priority: "high", assignee: teamMembers[0], department: "Design",
    startDate: "2026-02-09", dueDate: "2026-02-12", dependencies: ["T-003"],
    comments: [{ author: "Binita Shah", text: "Working on the hero section first", date: "2026-02-10" }],
    project: "Acme Corp Website",
  },
  {
    id: "T-002", title: "Implement auth system", description: "Set up login and password reset flows",
    status: "in-progress", priority: "urgent", assignee: teamMembers[1], department: "Design",
    startDate: "2026-02-08", dueDate: "2026-02-11", dependencies: [],
    comments: [{ author: "Dharmesh", text: "OAuth integration complete", date: "2026-02-10" }],
    project: "Internal Dashboard",
  },
  {
    id: "T-003", title: "Write homepage copy", description: "Draft content for homepage sections",
    status: "blocked", priority: "high", assignee: teamMembers[2], department: "Content",
    startDate: "2026-02-07", dueDate: "2026-02-10", dependencies: [],
    blockedReason: "Waiting for client brand guidelines",
    comments: [{ author: "Sonali", text: "Client hasn't shared brand doc yet", date: "2026-02-09" }],
    project: "Acme Corp Website",
  },
  {
    id: "T-004", title: "Q1 budget report", description: "Prepare quarterly budget analysis",
    status: "in-progress", priority: "medium", assignee: teamMembers[4], department: "Finance",
    startDate: "2026-02-08", dueDate: "2026-02-13", dependencies: [],
    comments: [], project: "Internal Operations",
  },
  {
    id: "T-005", title: "API endpoint for dashboard", description: "Build REST API endpoints for dashboard",
    status: "review", priority: "high", assignee: teamMembers[1], department: "Design",
    startDate: "2026-02-06", dueDate: "2026-02-11", dependencies: ["T-002"],
    comments: [{ author: "Dharmesh", text: "PR ready for review", date: "2026-02-10" }],
    project: "Internal Dashboard",
  },
  {
    id: "T-006", title: "Setup CI/CD pipeline", description: "Configure automated build and deployment",
    status: "done", priority: "high", assignee: teamMembers[1], department: "Design",
    startDate: "2026-02-05", dueDate: "2026-02-08", dependencies: [],
    comments: [{ author: "Dharmesh", text: "Pipeline running on main branch", date: "2026-02-08" }],
    project: "Internal Dashboard",
  },
];

export const projects = ["Acme Corp Website", "Internal Dashboard", "Internal Operations"];

// Milestone Types
export type MilestoneStatus = "pending" | "in-progress" | "completed" | "flagged";

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  dayNumber: number;
  dueDate: string;
  status: MilestoneStatus;
  tasks: string[];
  deliverables: string[];
  flagged: boolean;
  flagReason?: string;
  reminders: Reminder[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  milestoneId: string;
  amount: number;
  currency: string;
  description: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  clientName: string;
  notes: string;
  paymentMethod?: string;
  paidDate?: string;
}

export interface PaymentReminder {
  id: string;
  invoiceId: string;
  projectId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  daysUntilDue: number;
  dueDate: string;
  clientName: string;
  status: "sent" | "paid" | "overdue";
}

export interface MilestoneLock {
  milestoneId: string;
  projectId: string;
  lockType: "content" | "financial" | "payment-reminder";
  lockDay: number;
  reason: string;
  isActive: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  startDate: string;
  endDate?: string;
  timeline?: string;
  reminderDate?: string;
  description?: string;
  status: "active" | "completed" | "on-hold";
  budget?: number;
  milestones: Milestone[];
  projectLinks: ProjectLink[];
  contentLocked: boolean;
  financialLocked: boolean;
  paymentReminderSentAt5Days: boolean;
}

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  addedBy: string;
  addedDate: string;
  category: "chatgpt" | "documentation" | "design" | "content" | "financial" | "other";
}

// Mock Milestones Data
export const milestones: Milestone[] = [
  {
    id: "M-001",
    projectId: "P-001",
    name: "Project Kickoff",
    description: "Initial setup and design planning",
    dayNumber: 0,
    dueDate: "2026-02-18",
    status: "completed",
    tasks: ["T-001", "T-003"],
    deliverables: ["2 Design mockups", "Content pieces"],
    flagged: false,
    reminders: [],
    createdAt: "2026-02-18",
    updatedAt: "2026-02-18",
  },
  {
    id: "M-002",
    projectId: "P-001",
    name: "Phase 1 Completion",
    description: "Designs and content approved",
    dayNumber: 25,
    dueDate: "2026-03-15",
    status: "in-progress",
    tasks: ["T-001"],
    deliverables: ["Approved designs", "Client sign-off"],
    flagged: false,
    reminders: [],
    createdAt: "2026-02-18",
    updatedAt: "2026-03-10",
  },
];

export const projectList: Project[] = [
  {
    id: "P-001",
    name: "Acme Corp Website Redesign",
    clientName: "Acme Corporation",
    startDate: "2026-02-18",
    endDate: "2026-05-18",
    status: "active",
    budget: 150000,
    milestones: milestones.filter((m) => m.projectId === "P-001"),
    projectLinks: [
      {
        id: "PL-001",
        title: "Design System Documentation",
        url: "https://www.figma.com/design/sample",
        description: "Complete design system with all components and guidelines",
        addedBy: "Binita Shah",
        addedDate: "2026-02-18",
        category: "design",
      },
      {
        id: "PL-002",
        title: "Project Budget Spreadsheet",
        url: "https://docs.google.com/spreadsheets/d/1sample",
        description: "Detailed budget breakdown and expense tracking",
        addedBy: "Sagar",
        addedDate: "2026-02-18",
        category: "financial",
      },
    ],
    contentLocked: false,
    financialLocked: false,
    paymentReminderSentAt5Days: false,
  },
  {
    id: "P-002",
    name: "Internal Dashboard Enhancement",
    clientName: "Internal",
    startDate: "2026-02-05",
    status: "active",
    budget: 80000,
    milestones: [
      {
        id: "M-003",
        projectId: "P-002",
        name: "Backend API Setup",
        description: "Complete API development",
        dayNumber: 0,
        dueDate: "2026-02-15",
        status: "completed",
        tasks: ["T-005"],
        deliverables: ["API endpoints", "Documentation"],
        flagged: false,
        reminders: [],
        createdAt: "2026-02-01",
        updatedAt: "2026-02-15",
      },
    ],
    projectLinks: [
      {
        id: "PL-003",
        title: "Technical Architecture Document",
        url: "https://docs.google.com/document/d/1archdoc",
        description: "System architecture and API documentation",
        addedBy: "Dharmesh",
        addedDate: "2026-02-05",
        category: "documentation",
      },
    ],
    contentLocked: false,
    financialLocked: false,
    paymentReminderSentAt5Days: false,
  },
  {
    id: "P-003",
    name: "Sales Portal Development",
    clientName: "Sales Department",
    startDate: "2026-02-10",
    endDate: "2026-04-10",
    status: "active",
    budget: 120000,
    milestones: [
      {
        id: "M-004",
        projectId: "P-003",
        name: "Requirements & Design",
        description: "Gather requirements and design portal",
        dayNumber: 0,
        dueDate: "2026-02-24",
        status: "completed",
        tasks: [],
        deliverables: ["Design docs", "Wireframes"],
        flagged: false,
        reminders: [],
        createdAt: "2026-02-10",
        updatedAt: "2026-02-24",
      },
      {
        id: "M-005",
        projectId: "P-003",
        name: "Frontend Development",
        description: "Build responsive UI",
        dayNumber: 15,
        dueDate: "2026-03-24",
        status: "in-progress",
        tasks: [],
        deliverables: ["UI components", "Pages"],
        flagged: false,
        reminders: [],
        createdAt: "2026-02-24",
        updatedAt: "2026-03-10",
      },
    ],
    projectLinks: [],
    contentLocked: false,
    financialLocked: false,
    paymentReminderSentAt5Days: false,
  },
  {
    id: "P-004",
    name: "Content Management System",
    clientName: "Publishing House",
    startDate: "2026-01-15",
    endDate: "2026-06-15",
    status: "active",
    budget: 200000,
    milestones: [
      {
        id: "M-006",
        projectId: "P-004",
        name: "System Architecture",
        description: "Design CMS architecture",
        dayNumber: 0,
        dueDate: "2026-02-15",
        status: "completed",
        tasks: [],
        deliverables: ["Architecture docs"],
        flagged: false,
        reminders: [],
        createdAt: "2026-01-15",
        updatedAt: "2026-02-15",
      },
      {
        id: "M-007",
        projectId: "P-004",
        name: "Database Setup",
        description: "Configure databases",
        dayNumber: 30,
        dueDate: "2026-03-15",
        status: "in-progress",
        tasks: [],
        deliverables: ["Database schema"],
        flagged: false,
        reminders: [],
        createdAt: "2026-02-15",
        updatedAt: "2026-03-05",
      },
      {
        id: "M-008",
        projectId: "P-004",
        name: "API Development",
        description: "Build REST APIs",
        dayNumber: 60,
        dueDate: "2026-04-15",
        status: "pending",
        tasks: [],
        deliverables: ["API endpoints"],
        flagged: false,
        reminders: [],
        createdAt: "2026-03-15",
        updatedAt: "2026-03-15",
      },
    ],
    projectLinks: [],
    contentLocked: false,
    financialLocked: false,
    paymentReminderSentAt5Days: false,
  },
  {
    id: "P-005",
    name: "Mobile App - Inventory Tracker",
    clientName: "Retail Chain",
    startDate: "2026-02-01",
    endDate: "2026-05-01",
    status: "active",
    budget: 180000,
    milestones: [
      {
        id: "M-009",
        projectId: "P-005",
        name: "App Design",
        description: "Design mobile app UI/UX",
        dayNumber: 0,
        dueDate: "2026-02-15",
        status: "completed",
        tasks: [],
        deliverables: ["Design specs", "Mockups"],
        flagged: false,
        reminders: [],
        createdAt: "2026-02-01",
        updatedAt: "2026-02-15",
      },
      {
        id: "M-010",
        projectId: "P-005",
        name: "Development Phase 1",
        description: "Develop core features",
        dayNumber: 15,
        dueDate: "2026-03-01",
        status: "in-progress",
        tasks: [],
        deliverables: ["Core features"],
        flagged: false,
        reminders: [],
        createdAt: "2026-02-15",
        updatedAt: "2026-03-05",
      },
    ],
    projectLinks: [],
    contentLocked: false,
    financialLocked: false,
    paymentReminderSentAt5Days: false,
  },
];

export const invoices: Invoice[] = [
  {
    id: "INV-001",
    invoiceNumber: "INV-2026-0001",
    projectId: "P-001",
    milestoneId: "M-002",
    amount: 45000,
    currency: "INR",
    description: "Phase 1: Design & Content - Acme Corp Website",
    issueDate: "2026-03-10",
    dueDate: "2026-04-10",
    status: "sent",
    clientName: "Acme Corp",
    notes: "Payment terms: Net 30 days",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "INV-002",
    invoiceNumber: "INV-2026-0002",
    projectId: "P-002",
    milestoneId: "M-003",
    amount: 30000,
    currency: "INR",
    description: "Internal Dashboard - Backend Development",
    issueDate: "2026-02-15",
    dueDate: "2026-03-15",
    status: "paid",
    clientName: "Internal",
    notes: "Internal project",
    paymentMethod: "Internal Transfer",
    paidDate: "2026-03-10",
  },
];

// Milestone locks for payment reminders, content lock, and financial lock
export const milestoneLocks: MilestoneLock[] = [
  {
    milestoneId: "M-002",
    projectId: "P-001",
    lockType: "payment-reminder",
    lockDay: 5,
    reason: "Payment reminder for milestone completion",
    isActive: true,
    createdAt: "2026-02-18",
  },
  {
    milestoneId: "M-002",
    projectId: "P-001",
    lockType: "content",
    lockDay: 10,
    reason: "Content lock - no new content can be added after day 10",
    isActive: true,
    createdAt: "2026-02-18",
  },
  {
    milestoneId: "M-002",
    projectId: "P-001",
    lockType: "financial",
    lockDay: 10,
    reason: "Financial lock - no additional expenses can be added after day 10",
    isActive: true,
    createdAt: "2026-02-18",
  },
];

export const statusConfig: Record<TaskStatus, { label: string; colorClass: string }> = {
  "todo": { label: "To Do", colorClass: "bg-status-todo" },
  "in-progress": { label: "In Progress", colorClass: "bg-status-in-progress" },
  "review": { label: "Review", colorClass: "bg-status-review" },
  "done": { label: "Done", colorClass: "bg-status-done" },
  "blocked": { label: "Blocked", colorClass: "bg-status-blocked" },
  "waiting": { label: "Waiting", colorClass: "bg-status-waiting" },
};

export const priorityConfig: Record<TaskPriority, { label: string; colorClass: string }> = {
  "urgent": { label: "Urgent", colorClass: "bg-priority-urgent" },
  "high": { label: "High", colorClass: "bg-priority-high" },
  "medium": { label: "Medium", colorClass: "bg-priority-medium" },
  "low": { label: "Low", colorClass: "bg-priority-low" },
};
