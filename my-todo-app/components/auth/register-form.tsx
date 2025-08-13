"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface RegisterFormProps {
  onRegister: (name: string, email: string) => void;
  onBackToLogin: () => void;
}

export function RegisterForm({ onRegister, onBackToLogin }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      onRegister(name.trim(), email.trim());
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            新規ユーザー登録
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                type="text"
                placeholder="田中太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="tanaka@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full"
                disabled={!name.trim() || !email.trim() || isLoading}
              >
                {isLoading ? "登録中..." : "新規登録"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={onBackToLogin}
              >
                ログイン画面に戻る
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}