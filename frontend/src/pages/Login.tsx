import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Eye, EyeOff, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      const success = loginWithEmail(email.trim(), password.trim());
      if (success) {
        navigate("/dashboard", { replace: true });
      } else {
        // Check if account exists
        const signedUpAccounts = JSON.parse(localStorage.getItem("signedUpAccounts") || "[]");
        const accountExists = signedUpAccounts.some(account => account.email === email.trim());
        
        if (!accountExists) {
          setError("Account not found. Please create an account first.");
        } else {
          setError("Invalid password. Please try again.");
        }
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient circles - subtle */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl animate-float" style={{ animationDuration: "12s" }}></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-100/20 rounded-full blur-3xl animate-float" style={{ animationDuration: "15s", animationDelay: "2s" }}></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden animate-slide-in-up">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 -translate-x-20 animate-pulse" style={{ animationDuration: "3s" }}></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 animate-pulse" style={{ animationDuration: "4s", animationDelay: "1s" }}></div>
            </div>
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-white">
              <h1 className="text-3xl font-bold mb-1 animate-fade-in">LOGIN</h1>
            </div>
          </div>

          {/* Form Container */}
          <div className="p-8 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded animate-shake">
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5 animate-slide-in-up" style={{ animationDelay: "0.3s" }} autoComplete="off">
              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 placeholder-gray-400 group-hover:border-blue-300"
                    disabled={isLoading}
                    autoComplete="off"
                    autoFocus
                  />
                  <Mail className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset link has been sent to your email.")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 placeholder-gray-400 group-hover:border-blue-300"
                    disabled={isLoading}                    autoComplete="new-password"                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer hover:text-gray-700 transition-colors">
                  Remember me
                </label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-blue-200"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to the system?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>

        {/* Bottom info */}
        <p className="text-center text-xs text-gray-500 mt-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          Protected by secure authentication
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.3;
          }
        }

        @keyframes float-emoji {
          0%, 100% {
            transform: translateY(0px) rotateZ(0deg);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-15px) rotateZ(5deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-30px) rotateZ(-5deg);
            opacity: 0.6;
          }
          75% {
            transform: translateY(-20px) rotateZ(3deg);
            opacity: 0.5;
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.7s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.7s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }

        .animate-float-emoji {
          animation: float-emoji 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
