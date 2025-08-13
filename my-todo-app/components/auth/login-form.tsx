"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { User } from "@/types/auth";

interface LoginFormProps {
  users: User[];
  onLogin: (user: User) => void;
  onShowRegister: () => void;
}

export function LoginForm({ users, onLogin, onShowRegister }: LoginFormProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const selectedUser = users.find(user => user.id === selectedUserId);
    if (selectedUser) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      onLogin(selectedUser);
      setIsLoading(false);
    }
  };

  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`
  }));

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            ログイン
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">ユーザーを選択</Label>
              <Select
                options={userOptions}
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                placeholder="ユーザーを選択してください"
              />
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={handleLogin}
                disabled={!selectedUserId || isLoading}
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onShowRegister}
              >
                新規ユーザー登録
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}