"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { TodoApp } from "@/components/todo-app";
import { UserHeader } from "@/components/user-header";
import { User } from "@/types/auth";

type AuthView = "login" | "register";

export function AppWrapper() {
  const { user, isAuthenticated, login, logout, register, getUsers } = useAuth();
  const [authView, setAuthView] = useState<AuthView>("login");

  const handleLogin = (selectedUser: User) => {
    login(selectedUser);
  };

  const handleRegister = (name: string, email: string) => {
    register(name, email);
  };

  const handleLogout = () => {
    logout();
    setAuthView("login");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        {authView === "login" ? (
          <LoginForm
            users={getUsers()}
            onLogin={handleLogin}
            onShowRegister={() => setAuthView("register")}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onBackToLogin={() => setAuthView("login")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        <UserHeader user={user} onLogout={handleLogout} />
        <TodoApp user={user} />
      </div>
    </div>
  );
}