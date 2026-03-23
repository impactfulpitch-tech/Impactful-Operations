import { useState, useEffect, useContext, createContext, ReactNode } from "react";
import { teamMembers } from "@/data/mockData";

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  type: "team-member" | "admin";
}

interface AuthContextType {
  user: AuthUser | null;
  login: (name: string, type: "team-member" | "admin") => boolean;
  loginWithEmail: (email: string, password: string) => boolean;
  signupTeamMember: (name: string, email: string, password: string, role: string, department: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
      }
    }
  }, []);

  const login = (name: string, type: "team-member" | "admin"): boolean => {
    if (type === "admin") {
      const adminUser: AuthUser = {
        id: "admin",
        name: "Binita Shah",
        role: "Administrator",
        department: "Admin",
        avatar: "BS",
        type: "admin",
      };
      setUser(adminUser);
      localStorage.setItem("authUser", JSON.stringify(adminUser));
      return true;
    } else {
      // Find team member by name in mockData
      const teamMember = teamMembers.find(
        (member) => member.name.toLowerCase() === name.toLowerCase()
      );

      if (teamMember) {
        const authUser: AuthUser = {
          id: teamMember.id,
          name: teamMember.name,
          role: teamMember.role,
          department: teamMember.department,
          avatar: teamMember.avatar,
          type: "team-member",
        };
        setUser(authUser);
        localStorage.setItem("authUser", JSON.stringify(authUser));
        return true;
      }
      
      // If not in mockData, try to find in localStorage team members
      const storedMembers = localStorage.getItem("allTeamMembers");
      if (storedMembers) {
        const teamMembersFromStorage = JSON.parse(storedMembers);
        const member = teamMembersFromStorage.find(
          (m: any) => m.name.toLowerCase() === name.toLowerCase()
        );
        if (member) {
          const authUser: AuthUser = {
            id: member.id,
            name: member.name,
            role: member.role,
            department: member.department,
            avatar: member.avatar,
            type: "team-member",
          };
          setUser(authUser);
          localStorage.setItem("authUser", JSON.stringify(authUser));
          return true;
        }
      }
      return false;
    }
  };

  const signupTeamMember = (name: string, email: string, password: string, role: string, department: string): boolean => {
    try {
      // Get existing team members from localStorage
      const storedMembers = localStorage.getItem("allTeamMembers");
      const teamMembersArray = storedMembers ? JSON.parse(storedMembers) : [];
      
      // Check if member already exists by email
      const memberExists = teamMembersArray.some((m: any) => m.email === email);
      if (memberExists) {
        return false; // Email already registered
      }
      
      // Create new team member
      const newTeamMember = {
        id: `TM${Date.now()}`,
        name: name,
        email: email,
        role: role,
        department: department,
        avatar: name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase(),
        taskCount: 0,
      };
      
      // Add to localStorage
      teamMembersArray.push(newTeamMember);
      localStorage.setItem("allTeamMembers", JSON.stringify(teamMembersArray));
      
      // Store signup credentials for login verification
      const signedUpAccounts = JSON.parse(localStorage.getItem("signedUpAccounts") || "[]");
      signedUpAccounts.push({
        id: newTeamMember.id,
        name: newTeamMember.name,
        email: email,
        password: password,
        role: role,
        department: department,
        avatar: newTeamMember.avatar,
      });
      localStorage.setItem("signedUpAccounts", JSON.stringify(signedUpAccounts));
      
      // Auto-login the new user
      const authUser: AuthUser = {
        id: newTeamMember.id,
        name: newTeamMember.name,
        role: newTeamMember.role,
        department: newTeamMember.department,
        avatar: newTeamMember.avatar,
        type: "team-member",
      };
      
      setUser(authUser);
      localStorage.setItem("authUser", JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  const loginWithEmail = (email: string, password: string): boolean => {
    // Admin credentials
    const adminCredentials = [
      { email: "binita@impactfulpitch.com", password: "Binita@1234", id: "admin_1", name: "Binita Shah" },
    ];

    // Check if admin credentials match
    const adminMatch = adminCredentials.find(
      (admin) => admin.email === email && admin.password === password
    );

    if (adminMatch) {
      const authUser: AuthUser = {
        id: adminMatch.id,
        name: adminMatch.name,
        role: "Administrator",
        department: "Admin",
        avatar: adminMatch.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        type: "admin",
      };
      setUser(authUser);
      localStorage.setItem("authUser", JSON.stringify(authUser));
      return true;
    }

    // Check if team member account exists (created during signup)
    const signedUpAccounts = JSON.parse(localStorage.getItem("signedUpAccounts") || "[]");
    const accountExists = signedUpAccounts.find(
      (account: any) => account.email === email && account.password === password
    );

    if (accountExists) {
      const authUser: AuthUser = {
        id: accountExists.id,
        name: accountExists.name,
        role: accountExists.role,
        department: accountExists.department,
        avatar: accountExists.avatar,
        type: "team-member",
      };
      
      setUser(authUser);
      localStorage.setItem("authUser", JSON.stringify(authUser));
      return true;
    }

    // Account does not exist - login fails
    console.error("❌ Login failed: Account not found or invalid credentials");
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authPassword");
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithEmail, signupTeamMember, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
