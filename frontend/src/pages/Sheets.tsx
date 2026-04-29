import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";
import { ClientRecord, clientSheets as defaultClientSheets } from "@/data/clientData";
import { Search, FileSpreadsheet, AlertCircle, Clock, Phone, Edit2, Trash2, Download, Upload, Eye } from "lucide-react";
import { AddAdminButton } from "@/components/AddAdminButton";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { logActivity } from "@/hooks/useActivityLog";
import { exportClientSheetsToExcel, importClientSheetsFromExcel } from "@/lib/excelExport";

const categoryColors: Record<string, string> = {
  client: "bg-primary/10 text-primary",
  content: "bg-status-review/10 text-status-review",
  design: "bg-status-waiting/10 text-status-waiting",
  "content and client": "bg-status-in-progress/10 text-status-in-progress",
  "client and content": "bg-status-in-progress/10 text-status-in-progress",
};

function getStatusColor(status: string): string {
  if (!status) return "bg-gray-100 text-gray-800";
  const s = status.toLowerCase();
  if (s.includes("paid") || s.includes("completed")) return "bg-green-200 text-green-900 font-semibold";
  if (s.includes("not receiving") || s.includes("not responding")) return "bg-red-200 text-red-900 font-semibold";
  if (s.includes("hold") || s.includes("busy")) return "bg-yellow-200 text-yellow-900 font-semibold";
  if (s.includes("in progress") || s.includes("in discussion")) return "bg-blue-200 text-blue-900 font-semibold";
  if (s.includes("pending") || s.includes("awaiting")) return "bg-purple-200 text-purple-900 font-semibold";
  return "bg-gray-200 text-gray-800";
}

function getStatusIcon(status: string) {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s.includes("not receiving") || s.includes("not responding")) return <Phone className="w-3 h-3 text-status-blocked" />;
  if (s.includes("hold") || s.includes("busy")) return <AlertCircle className="w-3 h-3 text-status-review" />;
  return <Clock className="w-3 h-3 text-muted-foreground" />;
}

function getSheetStats(records: ClientRecord[]) {
  return {
    totalAmount: records.reduce((s, r) => s + (r.amount || 0), 0),
    notResponding: records.filter((r) => r.status.toLowerCase().includes("not receiving")).length,
    onHold: records.filter((r) => r.status.toLowerCase().includes("hold")).length,
  };
}

export default function Sheets() {
  const { user } = useAuth();
  const isAdmin = user?.type === "admin";
  
  // Initialize with default client sheets directly
  const [sheets, setSheets] = useState(defaultClientSheets);

  const [activeSheet, setActiveSheet] = useState("current");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddSheetModal, setShowAddSheetModal] = useState(false);
  const [showAllSheetsModal, setShowAllSheetsModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ClientRecord | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [uploadedSheets, setUploadedSheets] = useState<any[]>(() => {
    const stored = localStorage.getItem("uploadedExcelSheets");
    return stored ? JSON.parse(stored) : [];
  });

  // Save sheets to localStorage whenever they change
  useEffect(() => {
    if (sheets.length > 0) {
      localStorage.setItem("clientSheets", JSON.stringify(sheets));
    }
  }, [sheets]);

  // Save uploaded sheets to localStorage
  useEffect(() => {
    localStorage.setItem("uploadedExcelSheets", JSON.stringify(uploadedSheets));
  }, [uploadedSheets]);

  const handleExportToExcel = () => {
    exportClientSheetsToExcel(sheets, activeSheet);
  };

  const handleImportFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportMessage("");
    setImportError("");

    try {
      const importedSheets = await importClientSheetsFromExcel(file);
      // Append imported sheets to existing sheets, don't replace them
      const updatedSheets = [...sheets, ...importedSheets];
      setSheets(updatedSheets);
      
      // Switch to the first imported sheet so user can see the data
      if (importedSheets.length > 0) {
        setActiveSheet(importedSheets[0].id);
      }
      
      setImportMessage(`Successfully imported ${importedSheets.length} sheet(s) with data!`);
      logActivity({
        type: "add",
        entity: "sheet",
        title: file.name,
        description: `Excel file imported - ${importedSheets.length} sheet(s) with ${importedSheets.reduce((sum, s) => sum + s.records.length, 0)} total records`,
        user: isAdmin ? "HR Admin" : "User",
      });
      setTimeout(() => setImportMessage(""), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to import Excel file";
      setImportError(errorMsg);
      setTimeout(() => setImportError(""), 3000);
    }

    // Reset input so same file can be imported again
    event.target.value = "";
  };

  const handleUploadSheet = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const newSheet = {
          id: `SHEET${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          file_name: file.name,
          size: (file.size / 1024).toFixed(2) + " KB",
          uploaded_at: new Date().toLocaleString("en-IN"),
          upload_date: new Date().toISOString().split("T")[0],
          status: "imported",
          records: 0,
        };
        setUploadedSheets([...uploadedSheets, newSheet]);
        logActivity({
          type: "add",
          entity: "excel-sheet",
          title: file.name,
          description: `Excel sheet uploaded - Size: ${newSheet.size}`,
          user: isAdmin ? "HR Admin" : "User",
        });
      };
      fileReader.readAsArrayBuffer(file);
      event.target.value = "";
    } catch (error) {
      console.error("Error uploading sheet:", error);
      event.target.value = "";
    }
  };

  const handleDeleteUploadedSheet = (sheetId: string) => {
    setUploadedSheets(uploadedSheets.filter(s => s.id !== sheetId));
    logActivity({
      type: "delete",
      entity: "excel-sheet",
      title: "Sheet deleted",
      description: `Uploaded Excel sheet removed`,
      user: "HR Admin",
    });
  };

  const currentSheet = sheets.find((s) => s.id === activeSheet);
  const records = currentSheet?.records || [];

  const filtered = records.filter((r) => {
    if (filterCat !== "all" && !r.category.includes(filterCat)) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.action.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = getSheetStats(filtered);

  const handleAddClient = () => {
    setShowAddModal(true);
  };

  const handleAddSheet = () => {
    if (newSheetName.trim()) {
      const newSheet = {
        id: `SHEET${Date.now()}`,
        name: newSheetName.trim(),
        records: [],
      };
      setSheets([...sheets, newSheet]);
      setActiveSheet(newSheet.id);
      setNewSheetName("");
      setShowAddSheetModal(false);
      logActivity({
        type: "add",
        entity: "sheet",
        title: newSheetName.trim(),
        description: `New client sheet created`,
        user: isAdmin ? "HR Admin" : "User",
      });
    }
  };

  const handleAddClientSubmit = (data: Record<string, any>) => {
    const newClient: ClientRecord = {
      id: `C${Date.now()}`,
      name: data.name,
      status: data.status || "Initial contact",
      amount: parseInt(data.amount) || 0,
      action: data.action || "Follow up",
      category: data.category || "client",
    };

    setSheets(
      sheets.map((sheet) =>
        sheet.id === activeSheet
          ? { ...sheet, records: [...sheet.records, newClient] }
          : sheet
      )
    );
    logActivity({
      type: "add",
      entity: "client",
      title: data.name,
      description: `New client added - Category: ${data.category || "client"}`,
      user: "HR Admin",
    });
    setShowAddModal(false);
  };

  const handleEditRecord = (record: ClientRecord) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleEditSubmit = (data: Record<string, any>) => {
    if (selectedRecord) {
      setSheets(
        sheets.map((sheet) =>
          sheet.id === activeSheet
            ? {
                ...sheet,
                records: sheet.records.map((r) =>
                  r.id === selectedRecord.id
                    ? {
                        ...r,
                        name: data.name,
                        amount: parseInt(data.amount) || r.amount,
                        status: data.status,
                        action: data.action,
                        category: data.category,
                      }
                    : r
                ),
              }
            : sheet
        )
      );
      logActivity({
        type: "edit",
        entity: "client",
        title: data.name,
        description: `Client record updated - Status: ${data.status}`,
        user: "HR Admin",
      });
      setShowEditModal(false);
      setSelectedRecord(null);
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    const record = records.find((r) => r.id === recordId);
    if (record) {
      setSelectedRecord(record);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      setSheets(
        sheets.map((sheet) =>
          sheet.id === activeSheet
            ? {
                ...sheet,
                records: sheet.records.filter((r) => r.id !== selectedRecord.id),
              }
            : sheet
        )
      );
      logActivity({
        type: "delete",
        entity: "client",
        title: selectedRecord.name,
        description: `Client record deleted`,
        user: "HR Admin",
      });
      setShowDeleteConfirm(false);
      setSelectedRecord(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      {/* Uploaded Excel Sheets Section */}
      {isAdmin && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">📊 Upload Excel Sheets</h2>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload Sheet</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleUploadSheet}
                className="hidden"
                title="Upload Excel or CSV sheet"
              />
            </label>
          </div>

          {uploadedSheets.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Sheet Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">File Size</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Uploaded Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedSheets.map((sheet, idx) => (
                      <tr key={sheet.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{sheet.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{sheet.file_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-slate-600 dark:text-slate-400 text-xs">{sheet.size}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{sheet.uploaded_at}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            ✓ Imported
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteUploadedSheet(sheet.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors text-slate-500 dark:text-slate-400"
                            title="Delete sheet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      {isAdmin && uploadedSheets.length > 0 && <hr className="border-slate-200 dark:border-slate-700" />}

      {/* Original Client Tracker Section */}
      <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-2.5">
        <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Client Tracker</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Pipeline & follow-ups</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAllSheetsModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium transition-colors border border-indigo-200"
            title="View all sheets"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">All Sheets ({sheets.length})</span>
            <span className="inline sm:hidden">{sheets.length}</span>
          </button>
          <button
            onClick={() => setShowAddSheetModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-sm font-medium transition-colors border border-purple-200"
            title="Create new sheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">New Sheet</span>
          </button>
          <button
            onClick={handleExportToExcel}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium transition-colors border border-green-200"
            title="Export to Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors border border-blue-200 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportFromExcel}
              className="hidden"
              title="Import from Excel"
            />
          </label>
          <AddAdminButton label="Client" onClick={handleAddClient} isAdmin={isAdmin} />
        </div>
      </div>

      {/* Messages */}
      {importMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          ✓ {importMessage}
        </div>
      )}
      {importError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          ✗ {importError}
        </div>
      )}

      {/* Sheet Selector Dropdown & Tabs */}
      <div className="space-y-3">
        {/* Admin Sheet Selector Dropdown */}
        {isAdmin && sheets.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Select Sheet</p>
                <select
                  value={activeSheet}
                  onChange={(e) => {
                    setActiveSheet(e.target.value);
                    setSearch("");
                    setFilterCat("all");
                  }}
                  className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                >
                  {sheets.map((sheet) => (
                    <option key={sheet.id} value={sheet.id}>
                      {sheet.name} ({sheet.records.length} records)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="font-medium">{sheets.length} sheet{sheets.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sheet Tabs - Alternative view */}
        <div className="flex gap-0.5 border-b border-border overflow-x-auto">
          {sheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => {
                setActiveSheet(sheet.id);
                setSearch("");
                setFilterCat("all");
              }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeSheet === sheet.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              title={`${sheet.name} - ${sheet.records.length} records`}
            >
              {sheet.name}
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded">
                {sheet.records.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-card border border-border rounded-lg p-2.5 sm:p-3.5">
          <p className="text-xs text-muted-foreground mb-1">Sheet Records</p>
          <p className="text-base sm:text-lg font-bold text-card-foreground">{records.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-2.5 sm:p-3.5">
          <p className="text-xs text-muted-foreground mb-1">Pipeline</p>
          <p className="text-base sm:text-lg font-bold text-card-foreground">₹{stats.totalAmount.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-2.5 sm:p-3.5">
          <p className="text-xs text-status-blocked mb-1">Not Responding</p>
          <p className="text-base sm:text-lg font-bold text-status-blocked">{stats.notResponding}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-2.5 sm:p-3.5">
          <p className="text-xs text-status-review mb-1">On Hold</p>
          <p className="text-base sm:text-lg font-bold text-status-review">{stats.onHold}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-52"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="client">Client</option>
          <option value="content">Content</option>
          <option value="design">Design</option>
        </select>
      </div>

      {/* Excel View */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header Row */}
            <div className="grid gap-0 border-b-2 border-border bg-muted/70" style={{ gridTemplateColumns: "repeat(9, minmax(150px, 1fr))" }}>
              <div className="px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground border-r border-border">#</div>
              <div className="px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground border-r border-border">Client</div>
              <div className="px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground border-r border-border">Amount</div>
              <div className="px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground border-r border-border">Where</div>
              <div className="px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground border-r border-border">Status</div>
              <div className="px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground border-r border-border">Category</div>
              <div className="px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground border-r border-border">Follow-up</div>
              <div className="px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground border-r border-border">Action</div>
              {isAdmin && <div className="px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground text-center">Edit/Delete</div>}
            </div>

            {/* Data Rows */}
            {filtered.length > 0 ? (
              filtered.map((r, idx) => (
                <div key={r.id} className={`grid gap-0 border-b border-border hover:bg-accent/50 transition-colors ${idx % 2 === 0 ? "bg-background/50" : "bg-background"}`} style={{ gridTemplateColumns: "repeat(9, minmax(150px, 1fr))" }}>
                  <div className="px-3 py-2.5 text-xs sm:text-sm text-foreground border-r border-border font-bold bg-muted">{idx + 1}</div>
                  <div className="px-3 py-2.5 text-xs sm:text-sm text-foreground border-r border-border font-medium">{r.name || "—"}</div>
                  <div className="px-3 py-2.5 text-xs sm:text-sm text-foreground border-r border-border text-right font-semibold">
                    {r.amount ? `₹${r.amount.toLocaleString("en-IN")}` : "—"}
                  </div>
                  <div className="px-3 py-2.5 text-xs sm:text-sm text-foreground border-r border-border">{r.where || "—"}</div>
                  <div className="px-3 py-2.5 text-xs sm:text-sm border-r border-border">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-[11px] ${getStatusColor(r.status)}`}>
                      {getStatusIcon(r.status)}
                      <span className="truncate">{r.status || "—"}</span>
                    </span>
                  </div>
                  <div className="px-3 py-2.5 text-xs sm:text-sm border-r border-border">
                    <span className={`block text-center text-[10px] sm:text-[11px] px-2 py-1 rounded font-medium ${categoryColors[r.category] || "bg-secondary text-secondary-foreground"}`}>
                      {r.category}
                    </span>
                  </div>
                  <div className="px-3 py-2.5 text-xs sm:text-sm text-foreground border-r border-border">{r.followUp || "—"}</div>
                  <div className="px-3 py-2.5 text-xs sm:text-sm text-foreground border-r border-border">{r.action || "—"}</div>
                  {isAdmin && (
                    <div className="px-3 py-2.5 text-xs sm:text-sm text-foreground flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditRecord(r)}
                        className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground hover:text-primary"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        className="p-1.5 hover:bg-status-blocked/10 hover:text-status-blocked rounded-lg transition-colors text-muted-foreground hover:text-status-blocked"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : records.length === 0 ? (
              <div className="px-3 py-12 text-center">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  <strong>{currentSheet?.name}</strong> sheet is empty
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click "+ Client" button to add the first record
                </p>
              </div>
            ) : (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results matching your filters
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal title="Add Client" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <Form
          fields={[
            { name: "name", label: "Client Name", type: "text", placeholder: "Client company name", required: true },
            { name: "amount", label: "Amount (₹)", type: "text", placeholder: "10000", required: true },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "Initial contact", label: "Initial contact" },
                { value: "In discussion", label: "In discussion" },
                { value: "On Hold", label: "On Hold" },
                { value: "Not responding", label: "Not responding" },
              ],
            },
            {
              name: "category",
              label: "Category",
              type: "select",
              options: [
                { value: "client", label: "Client" },
                { value: "content", label: "Content" },
                { value: "design", label: "Design" },
                { value: "content and client", label: "Content & Client" },
              ],
            },
            { name: "action", label: "Follow-up Action", type: "text", placeholder: "e.g., Send proposal" },
          ]}
          onSubmit={handleAddClientSubmit}
          submitLabel="Add Client"
        />
      </Modal>

      {/* Edit Client Modal */}
      <Modal title="Edit Client" isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        {selectedRecord && (
          <Form
            fields={[
              { name: "name", label: "Client Name", type: "text", placeholder: "Client company name", required: true },
              { name: "amount", label: "Amount (₹)", type: "text", placeholder: "10000", required: true },
              {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                  { value: "Initial contact", label: "Initial contact" },
                  { value: "In discussion", label: "In discussion" },
                  { value: "On Hold", label: "On Hold" },
                  { value: "Not responding", label: "Not responding" },
                ],
              },
              {
                name: "category",
                label: "Category",
                type: "select",
                options: [
                  { value: "client", label: "Client" },
                  { value: "content", label: "Content" },
                  { value: "design", label: "Design" },
                  { value: "content and client", label: "Content & Client" },
                ],
              },
              { name: "action", label: "Follow-up Action", type: "text", placeholder: "e.g., Send proposal" },
            ]}
            initialData={selectedRecord}
            onSubmit={handleEditSubmit}
            submitLabel="Update Client"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal title="Delete Client" isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{selectedRecord?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Add New Sheet Modal */}
      <Modal title="Create New Sheet" isOpen={showAddSheetModal} onClose={() => setShowAddSheetModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Sheet Name</label>
            <input
              type="text"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              placeholder="e.g., Q1 Prospects, Hot Leads, etc."
              className="w-full mt-1.5 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSheet();
              }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setNewSheetName("");
                setShowAddSheetModal(false);
              }}
              className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSheet}
              disabled={!newSheetName.trim()}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Sheet
            </button>
          </div>
        </div>
      </Modal>

      {/* All Sheets Modal */}
      <Modal 
        title={`All Sheets (${sheets.length})`} 
        isOpen={showAllSheetsModal} 
        onClose={() => setShowAllSheetsModal(false)}
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sheets.length > 0 ? (
            sheets.map((sheet) => (
              <div
                key={sheet.id}
                onClick={() => {
                  setActiveSheet(sheet.id);
                  setShowAllSheetsModal(false);
                  setSearch("");
                  setFilterCat("all");
                }}
                className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeSheet === sheet.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{sheet.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {sheet.records.length} record{sheet.records.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activeSheet === sheet.id && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No sheets available</p>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
