import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  Sun,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const baseNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Sun, label: "Today", path: "/today" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: Users, label: "Team", path: "/team" },
  { icon: Calendar, label: "Timeline", path: "/timeline" },
  { icon: BarChart3, label: "Analytics", path: "/reports" },
  { icon: FileSpreadsheet, label: "Clients", path: "/sheets" },
];

const adminNavItems = [
  { icon: DollarSign, label: "Payments", path: "/payments" },
];

export default function AppSidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const isAdmin = user?.type === "admin";
  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          IO
        </div>
        {!collapsed && <span className="text-slate-300 font-semibold text-sm animate-fade-in">Impactful</span>}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Collapse Button */}
      {!isMobile && (
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </>
  );

  // Mobile: Show hamburger menu
  if (isMobile) {
    return (
      <>
        {/* Mobile Top Bar */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-slate-950 border-b border-slate-800 flex items-center px-4 z-40">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              IP
            </div>
            <span className="ml-2 text-white font-bold">Admin</span>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setMobileOpen(false)}
            />
            {/* Sidebar */}
            <aside className="fixed left-0 top-14 h-[calc(100vh-56px)] w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-40 overflow-y-auto">
              {sidebarContent}
            </aside>
          </>
        )}
      </>
    );
  }

  // Desktop: Show fixed sidebar
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 z-40 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      {sidebarContent}
    </aside>
  );
}
