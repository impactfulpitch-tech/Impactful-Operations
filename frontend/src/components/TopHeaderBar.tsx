import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { RemindersBell } from "./RemindersBell";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Top App Header with Reminders Bell and User Menu
 * Shows on all pages with quick access to project reminders
 */
export function TopHeaderBar() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div
      className={`fixed top-0 ${
        isMobile ? "left-0 right-0 h-14" : "left-0 right-0 ml-56 h-16"
      } bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 z-40 transition-all duration-300`}
    >
      {/* Left spacer */}
      <div className="flex-1" />

      {/* Right: Reminders Bell & User Menu */}
      <div className="flex items-center gap-4">
        <RemindersBell />

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.avatar}
                </div>
                <div className="hidden sm:block text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400lowercase">{user.type === "admin" ? "Admin" : user.role}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{user.role}</p>
                {user.type !== "admin" && (
                  <p className="text-xs text-slate-500 dark:text-slate-500">📍 {user.department}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="text-xs text-slate-600 dark:text-slate-400">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
