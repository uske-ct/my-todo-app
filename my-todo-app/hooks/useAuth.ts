"use client";

import { useState, useEffect } from "react";
import { User, AuthState } from "@/types/auth";

const STORAGE_KEY = "todo-auth";
const USERS_KEY = "todo-users";

const DEFAULT_USERS: User[] = [
  { id: "1", name: "田中太郎", email: "tanaka@example.com" },
  { id: "2", name: "佐藤花子", email: "sato@example.com" },
  { id: "3", name: "山田次郎", email: "yamada@example.com" },
];

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem(STORAGE_KEY);
      if (storedAuth) {
        const parsedAuth: AuthState = JSON.parse(storedAuth);
        setAuthState(parsedAuth);
      }
      
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (!storedUsers) {
        localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }
    }
  }, []);

  const login = (user: User) => {
    const newAuthState: AuthState = {
      user,
      isAuthenticated: true,
    };
    setAuthState(newAuthState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
  };

  const logout = () => {
    const newAuthState: AuthState = {
      user: null,
      isAuthenticated: false,
    };
    setAuthState(newAuthState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const register = (name: string, email: string): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as User[];
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
    };
    
    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    login(newUser);
    return newUser;
  };

  const getUsers = (): User[] => {
    if (typeof window === "undefined") return DEFAULT_USERS;
    const storedUsers = localStorage.getItem(USERS_KEY);
    return storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS;
  };

  return {
    ...authState,
    login,
    logout,
    register,
    getUsers,
  };
}