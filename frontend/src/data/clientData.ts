export interface ClientRecord {
  id: number;
  name: string;
  amount: number | null;
  remarks: string;
  where: string;
  status: string;
  category: string;
  followUp: string;
  action: string;
}

export interface ClientSheet {
  id: string;
  name: string;
  records: ClientRecord[];
}

export const originalClientRecords: ClientRecord[] = [
  { id: 1, name: "MEGA INFOSOLUTIONS PVT", amount: 106200, remarks: "not receiving calls", where: "content / Client", status: "not receiving the calls", category: "content", followUp: "Not receiving any call", action: "Need to set up a meeting" },
  { id: 2, name: "Ms Bala", amount: 43000, remarks: "following up", where: "Client", status: "awaiting response", category: "client", followUp: "by this week", action: "not responding" },
  { id: 3, name: "Zoivane", amount: 53250, remarks: "On Hold", where: "Project on hold", status: "on hold", category: "client", followUp: "on hold", action: "Hold" },
  { id: 4, name: "Ocean Blue", amount: 118000, remarks: "In discussion", where: "Design phase", status: "in progress", category: "client", followUp: "Trying to reach out", action: "waiting for confirmation" },
  { id: 5, name: "Ecoline Exim Pvt Ltd.", amount: 63425, remarks: "Active", where: "content", status: "in progress", category: "content", followUp: "this week", action: "awaiting review" },
];

export const archivedClientRecords: ClientRecord[] = [
  { id: 6, name: "TechStart Solutions", amount: 95000, remarks: "project completed", where: "Client", status: "completed", category: "client", followUp: "closed", action: "archived" },
  { id: 7, name: "Digital First Pvt Ltd", amount: 120000, remarks: "delivered successfully", where: "content", status: "completed", category: "content", followUp: "closed", action: "archived" },
];

export const clientSheets: ClientSheet[] = [
  { id: "current", name: "Current Pipeline", records: originalClientRecords },
  { id: "archived", name: "Completed", records: archivedClientRecords },
];

// Default export for backward compatibility
export const clientRecords = originalClientRecords;
