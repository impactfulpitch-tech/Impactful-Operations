import { Download, FileSpreadsheet } from "lucide-react";

interface ExportButtonsProps {
  onExportAll: () => void;
  onExportTasks: () => void;
  onExportDepartments: () => void;
  onExportTeam: () => void;
  isLoading?: boolean;
}

export function ExportButtons({
  onExportAll,
  onExportTasks,
  onExportDepartments,
  onExportTeam,
  isLoading = false,
}: ExportButtonsProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Export Reports
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Download reports in Excel format for offline use</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Export All */}
        <button
          onClick={onExportAll}
          disabled={isLoading}
          className="group relative inline-flex flex-col items-center gap-2 px-4 py-4 bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          title="Download complete report with all data"
        >
          <Download className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-xs sm:text-sm font-semibold text-center">Full Report</span>
          <span className="text-[10px] text-blue-100 group-hover:text-blue-50">All Data</span>
        </button>

        {/* Export Tasks */}
        <button
          onClick={onExportTasks}
          disabled={isLoading}
          className="group relative inline-flex flex-col items-center gap-2 px-4 py-4 bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          title="Download tasks list"
        >
          <Download className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-xs sm:text-sm font-semibold text-center">Tasks</span>
          <span className="text-[10px] text-emerald-100 group-hover:text-emerald-50">All Tasks</span>
        </button>

        {/* Export Departments */}
        <button
          onClick={onExportDepartments}
          disabled={isLoading}
          className="group relative inline-flex flex-col items-center gap-2 px-4 py-4 bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          title="Download department statistics"
        >
          <Download className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-xs sm:text-sm font-semibold text-center">Departments</span>
          <span className="text-[10px] text-purple-100 group-hover:text-purple-50">Stats</span>
        </button>

        {/* Export Team */}
        <button
          onClick={onExportTeam}
          disabled={isLoading}
          className="group relative inline-flex flex-col items-center gap-2 px-4 py-4 bg-gradient-to-br from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          title="Download team member information"
        >
          <Download className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-xs sm:text-sm font-semibold text-center">Team</span>
          <span className="text-[10px] text-orange-100 group-hover:text-orange-50">Members</span>
        </button>

        {/* Information Card */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/30 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
          <div className="text-2xl">📱</div>
          <div className="text-xs sm:text-sm">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Works on</p>
            <p className="text-slate-600 dark:text-slate-400">Desktop & Mobile</p>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700/50 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Tip:</strong> Excel files can be opened on any device - laptops, tablets, and phones. Use them for daily tracking and reporting.
        </p>
      </div>
    </div>
  );
}
