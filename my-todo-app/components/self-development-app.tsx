'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createUserProfile, getUserProfile } from '@/lib/supabase/profile';
import { createGoal, getUserGoals, Goal } from '@/lib/supabase/goals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Target, CheckCircle, Clock } from 'lucide-react';

interface SelfDevelopmentAppProps {
  user: User;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function SelfDevelopmentApp({ user }: SelfDevelopmentAppProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'goals' | 'dashboard'>('welcome');
  const [userGoals, setUserGoals] = useState<Goal[]>([]);

  useEffect(() => {
    initializeUser();
  }, [user]);

  async function initializeUser() {
    try {
      // プロフィールを取得
      let { data: profileData, error } = await getUserProfile(user.id);
      
      if (error && error.code === 'PGRST116') {
        // プロフィールが存在しない場合は作成
        const { data: newProfile, error: createError } = await createUserProfile(
          user.id,
          user.email || '',
          user.user_metadata?.full_name
        );
        
        if (createError) {
          console.error('プロフィール作成エラー:', createError);
        } else {
          profileData = newProfile;
          console.log('プロフィールを作成しました:', newProfile);
        }
      }
      
      if (profileData) {
        setProfile(profileData);
        
        // 既存の目標をチェック
        const { data: goalsData } = await getUserGoals(user.id);
        if (goalsData && goalsData.length > 0) {
          setUserGoals(goalsData);
          setCurrentStep('dashboard');
        } else {
          setCurrentStep('goals');
        }
      }
    } catch (err) {
      console.error('初期化エラー:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>アプリを初期化中...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>エラー</CardTitle>
            <CardDescription>
              プロフィールの作成に失敗しました。ページをリロードしてください。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleGoalCreated = (newGoal: Goal) => {
    setUserGoals([newGoal]);
    setCurrentStep('dashboard');
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">自己開発サポートアプリ</h1>
        <p className="opacity-90">ようこそ、{profile.name}さん</p>
        <p className="text-sm opacity-75">あなたの成長を全力でサポートします</p>
      </div>

      {/* メインコンテンツ */}
      {currentStep === 'goals' && <GoalsSection user={user} onGoalCreated={handleGoalCreated} />}
      {currentStep === 'dashboard' && <DashboardSection goals={userGoals} />}
    </div>
  );
}

interface GoalsSectionProps {
  user: User;
  onGoalCreated: (goal: Goal) => void;
}

function GoalsSection({ user, onGoalCreated }: GoalsSectionProps) {
  const [goals, setGoals] = useState({
    title: '',
    description: '',
    strengths: '',
    weaknesses: '',
    target_date: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data, error } = await createGoal({
        user_id: user.id,
        title: goals.title,
        description: goals.description,
        strengths: goals.strengths,
        weaknesses: goals.weaknesses,
        target_date: goals.target_date
      });

      if (error) {
        console.error('目標保存エラー:', error);
        alert('目標の保存に失敗しました。');
        return;
      }

      if (data) {
        console.log('目標を保存しました:', data);
        onGoalCreated(data);
      }
    } catch (err) {
      console.error('予期しないエラー:', err);
      alert('予期しないエラーが発生しました。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          目標・強み・弱みの整理
        </CardTitle>
        <CardDescription>
          まずはあなたの現状と理想を明確にしましょう
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">目標タイトル</Label>
            <Input
              id="title"
              value={goals.title}
              onChange={(e) => setGoals({ ...goals, title: e.target.value })}
              placeholder="例：国際的なビジネススキルを身につける"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">詳細な説明</Label>
            <Textarea
              id="description"
              value={goals.description}
              onChange={(e) => setGoals({ ...goals, description: e.target.value })}
              placeholder="具体的にどのような状態になりたいか詳しく説明してください"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="strengths">現在の強み</Label>
            <Textarea
              id="strengths"
              value={goals.strengths}
              onChange={(e) => setGoals({ ...goals, strengths: e.target.value })}
              placeholder="あなたが現在持っているスキルや特長"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="weaknesses">改善したい弱み</Label>
            <Textarea
              id="weaknesses"
              value={goals.weaknesses}
              onChange={(e) => setGoals({ ...goals, weaknesses: e.target.value })}
              placeholder="克服したい課題や不足していると感じるスキル"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="target_date">目標達成予定日</Label>
            <Input
              id="target_date"
              type="date"
              value={goals.target_date}
              onChange={(e) => setGoals({ ...goals, target_date: e.target.value })}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              '目標を保存して開始'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface DashboardSectionProps {
  goals: Goal[];
}

function DashboardSection({ goals }: DashboardSectionProps) {
  return (
    <div className="space-y-6">
      {/* 目標表示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            あなたの目標
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  {goal.target_date && (
                    <p className="text-xs text-gray-500 mt-2">
                      目標達成日: {new Date(goal.target_date).toLocaleDateString('ja-JP')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">目標が設定されていません</p>
          )}
        </CardContent>
      </Card>

      {/* ダッシュボード */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              今日のタスク
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">本日のアクションアイテムを確認</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              進捗状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">目標達成までの進捗を確認</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}