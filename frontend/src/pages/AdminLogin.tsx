import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, Shield, Zap, ArrowLeft } from "lucide-react";
import "../styles/admin-login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple admin auth (demo purposes - in production, verify against backend)
    if (
      formData.email === "binita@impactfulpitch.com" &&
      formData.password === "Binita@1234"
    ) {
      setIsLoading(true);
      setTimeout(() => {
        const success = login("admin", "admin");
        if (success) {
          navigate("/dashboard", { replace: true });
        } else {
          setError("Authentication failed. Please try again.");
        }
        setIsLoading(false);
      }, 500);
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-circle circle-1"></div>
        <div className="gradient-circle circle-2"></div>
        <div className="gradient-circle circle-3"></div>
      </div>

      {/* Content Container */}
      <div className="admin-login-container">
        {/* Left Panel - Branding */}
        <div className="admin-left-panel">
          <div className="admin-branding">
            <div className="admin-logo-wrapper">
              <div className="admin-logo-icon">
                <Shield className="w-12 h-12" />
              </div>
              <h1 className="admin-brand-title">Admin Portal</h1>
            </div>

            <p className="admin-brand-subtitle">Secure Management Dashboard</p>

            <div className="features-list">
              <div className="feature-item">
                <Zap className="w-5 h-5" />
                <span>Real-time Analytics</span>
              </div>
              <div className="feature-item">
                <Lock className="w-5 h-5" />
                <span>Secure Access</span>
              </div>
              <div className="feature-item">
                <Shield className="w-5 h-5" />
                <span>Full Control</span>
              </div>
            </div>

            <div className="animated-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="admin-right-panel">
          <div className="form-wrapper">
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Admin Dashboard Access</p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-form" autoComplete="off">
              {/* Email Field */}
              <div className="form-field-group">
                <label htmlFor="email" className="form-label">
                  <Mail className="label-icon" />
                  Email Address
                </label>
                <div className="input-wrapper">
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="admin-input"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-field-group">
                <label htmlFor="password" className="form-label">
                  <Lock className="label-icon" />
                  Password
                </label>
                <div className="input-wrapper password-wrapper">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="admin-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-password-btn"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="admin-submit-btn w-full"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
