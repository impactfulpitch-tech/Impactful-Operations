import { Plus } from "lucide-react";

interface AddAdminButtonProps {
  label: string;
  onClick: () => void;
  isAdmin?: boolean;
}

export function AddAdminButton({ label, onClick, isAdmin = true }: AddAdminButtonProps) {
  if (!isAdmin) return null;

  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 border border-blue-400/30 hover:border-blue-300/50 overflow-hidden"
      aria-label={`Add ${label}`}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
      
      <Plus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 group-active:scale-90" />
      <span className="hidden sm:inline">Add {label}</span>
      <span className="sm:hidden">+ {label}</span>
    </button>
  );
}
