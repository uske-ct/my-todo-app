'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestDbPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('接続中...');
  const [tables, setTables] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        // 接続テスト
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(1);

        if (error) {
          // テーブルが存在しない場合のエラーをチェック
          if (error.code === 'PGRST116' || error.message.includes('relation "users" does not exist')) {
            setConnectionStatus('✅ Supabase接続成功 - テーブルを作成してください');
          } else {
            setConnectionStatus(`❌ 接続エラー: ${error.message}`);
          }
        } else {
          setConnectionStatus('✅ Supabase接続成功 - データベース準備完了');
          setTables(data || []);
        }
      } catch (err) {
        setConnectionStatus(`❌ 接続エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      }
    }

    testConnection();
  }, [supabase]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">データベース接続テスト</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">接続状況</h2>
        <p className="text-lg">{connectionStatus}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">環境変数確認</h2>
        <div className="space-y-2">
          {mounted ? (
            <>
              <p>
                <span className="font-medium">Supabase URL:</span>{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定'}
              </p>
              <p>
                <span className="font-medium">Supabase Key:</span>{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ? '✅ 設定済み' : '❌ 未設定'}
              </p>
            </>
          ) : (
            <p>読み込み中...</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-3">SQLテーブル作成手順</h2>
        <div className="space-y-3">
          <p>1. <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabaseダッシュボード</a>にアクセス</p>
          <p>2. プロジェクトを選択</p>
          <p>3. 左メニューの「SQL Editor」をクリック</p>
          <p>4. プロジェクトルートの <code className="bg-gray-100 px-2 py-1 rounded">supabase-setup.sql</code> の内容をコピー&amp;ペースト</p>
          <p>5. 「Run」をクリックして実行</p>
        </div>
      </div>
    </div>
  );
}