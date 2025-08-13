"use client";

import { Button } from "@/components/ui/button";
import { User } from "@/types/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface UserHeaderProps {
  user: User;
  onLogout: () => void;
}

export function UserHeader({ user, onLogout }: UserHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-card border border-border rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            ようこそ、{user.name}さん
          </h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <Button variant="outline" onClick={onLogout}>
          ログアウト
        </Button>
      </div>
    </div>
  );
}