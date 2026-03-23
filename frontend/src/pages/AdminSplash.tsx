import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Check, Zap } from "lucide-react";

const AdminSplash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Logo Container */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-6 w-20 h-20 flex items-center justify-center">
              <Shield className="w-12 h-12 text-white animate-bounce" style={{ animationDelay: "0s" }} />
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xl text-blue-200">Admin Portal</p>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-4 justify-center items-center pt-6">
          <div className="flex items-center gap-3 text-blue-200 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Loading Dashboard</span>
          </div>
          <div className="flex items-center gap-3 text-blue-200 animate-fade-in" style={{ animationDelay: "1s" }}>
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Initializing Systems</span>
          </div>
          <div className="flex items-center gap-3 text-blue-200 animate-fade-in" style={{ animationDelay: "1.5s" }}>
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            <span>Ready for Operations</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4">
          <div className="w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-progress"></div>
          </div>
        </div>

        {/* Status Text */}
        <p className="text-sm text-slate-400 pt-4">Redirecting...</p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-progress {
          animation: progress 3.5s ease-in-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default AdminSplash;
