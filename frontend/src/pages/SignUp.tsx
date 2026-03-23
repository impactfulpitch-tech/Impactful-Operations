import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, ArrowLeft } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { signupTeamMember } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!formData.role) {
      setError("Please select a role");
      return;
    }
    if (!formData.department) {
      setError("Please select a department");
      return;
    }

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      try {
        // Create account using signupTeamMember
        const signupSuccess = signupTeamMember(
          formData.name.trim(),
          formData.email.trim(),
          formData.password,
          formData.role,
          formData.department
        );
        
        if (signupSuccess) {
          console.log("✅ Account created successfully for:", formData.email);
          setSuccess(true);
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1500);
        } else {
          console.log("❌ Account creation failed - Email already exists:", formData.email);
          setError("This email is already registered. Please use a different email or login instead.");
        }
      } catch (err) {
        console.error("❌ Signup error:", err);
        setError("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl animate-float" style={{ animationDuration: "12s" }}></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-100/20 rounded-full blur-3xl animate-float" style={{ animationDuration: "15s", animationDelay: "2s" }}></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden animate-slide-in-up">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-green-600 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 -translate-x-20 animate-pulse" style={{ animationDuration: "3s" }}></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 animate-pulse" style={{ animationDuration: "4s", animationDelay: "1s" }}></div>
            </div>
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-white">
              <h1 className="text-3xl font-bold mb-1 animate-fade-in">CREATE ACCOUNT</h1>
              <p className="text-sm text-emerald-100 animate-fade-in" style={{ animationDelay: "0.2s" }}>Join Our Team</p>
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

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded animate-slide-in-up">
                <p className="font-medium text-sm">✓ Account created successfully! Redirecting...</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-5 animate-slide-in-up" style={{ animationDelay: "0.3s" }} autoComplete="off">
              {/* Full Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-900 placeholder-gray-400 group-hover:border-emerald-300"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-900 placeholder-gray-400 group-hover:border-emerald-300"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-900 placeholder-gray-400 group-hover:border-emerald-300"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              {/* Role */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-900 group-hover:border-emerald-300 cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="">Select your position</option>
                  <option value="Designer">Designer</option>
                  <option value="Content Writer">Content Writer</option>
                  <option value="Content Specialist">Content Specialist</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              {/* Department */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-900 group-hover:border-emerald-300 cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="">Select your department</option>
                  <option value="Sales">Sales</option>
                  <option value="Content">Content</option>
                  <option value="Design">Design</option>
                  <option value="Market Research">Market Research</option>
                </select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || success}
                className="w-full h-11 mt-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-emerald-200"
              >
                <UserPlus className="w-5 h-5" />
                {isLoading ? "Creating account..." : success ? "Account created!" : "Create Account"}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Already have an account? <button onClick={() => navigate("/login")} type="button" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">Sign in</button></p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SignUp;
