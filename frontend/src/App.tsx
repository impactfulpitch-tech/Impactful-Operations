import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Today from "./pages/Today";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Timeline from "./pages/Timeline";
import Reports from "./pages/Reports";
import Sheets from "./pages/Sheets";
import Payments from "./pages/Payments";
import Milestones from "./pages/Milestones";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/today" element={<Today />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/team" element={<Team />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/milestones" element={<Milestones />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/sheets" element={<Sheets />} />
              <Route path="/payments" element={<Payments />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
