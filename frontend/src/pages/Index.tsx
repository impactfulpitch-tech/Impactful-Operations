import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Users, Shield, ArrowRight } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDuration: "8s" }}></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-float" style={{ animationDuration: "10s", animationDelay: "2s" }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDuration: "12s", animationDelay: "4s" }}></div>
        
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }}></div>
        
        {/* Animated lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 animate-pulse" style={{ animationDuration: "3s" }}></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20 animate-pulse" style={{ animationDuration: "3s", animationDelay: "1.5s" }}></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-in-down">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 dark:from-blue-200 dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent mb-4">
            HRFlow
          </h1>
          <p className="text-lg text-slate-300 dark:text-slate-400 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Modern HR Management & Team Collaboration
          </p>
        </div>

        {/* Login Cards - 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Team Member Login Card */}
          <button
            onClick={() => navigate("/login")}
            className="group relative rounded-2xl overflow-hidden bg-slate-800/50 dark:bg-slate-800/50 border border-slate-700 dark:border-slate-600 p-8 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95 text-left animate-slide-in-up backdrop-blur-sm"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent dark:from-blue-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-500/30">
                <Users className="w-6 h-6 text-blue-400 dark:text-blue-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 dark:text-white mb-2 flex items-center gap-2">
                  Team Member
                  <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </h2>
                <p className="text-sm text-slate-300 dark:text-slate-400 mb-4">
                  Sign in to your account and manage your tasks
                </p>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Access your dashboard
              </div>
            </div>
          </button>

          {/* Admin Login Card */}
          <button
            onClick={() => navigate("/admin-login")}
            className="group relative rounded-2xl overflow-hidden bg-slate-800/50 dark:bg-slate-800/50 border border-slate-700 dark:border-slate-600 p-8 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 active:scale-95 text-left animate-slide-in-up backdrop-blur-sm"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent dark:from-purple-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 dark:bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-purple-500/30">
                <Shield className="w-6 h-6 text-purple-400 dark:text-purple-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 dark:text-white mb-2 flex items-center gap-2">
                  Admin Panel
                  <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </h2>
                <p className="text-sm text-slate-300 dark:text-slate-400 mb-4">
                  Access full admin dashboard for complete control
                </p>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Secure admin access only
              </div>
            </div>
          </button>
        </div>

        {/* Create Account Option */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <p className="text-slate-300 dark:text-slate-400 mb-4 font-medium">Are you a Team Member?</p>
          <button 
            onClick={() => navigate("/signup")}
            className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-lg rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 animate-pulse"
            style={{ animationDuration: "2s" }}
          >
            Create Account Here
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-sm text-slate-400 dark:text-slate-500 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <p>Developed for Binita Shah's HR Management System</p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(30px);
          }
        }

        .animate-slide-in-down {
          animation: slide-in-down 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;
