"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PunchButton from "@/components/PunchButton";
import ImageCard from "@/components/ImageCard";

interface AttendanceRecord {
  id: string;
  type: string;
  timestamp: string;
  date: string;
}

export default function PunchPage() {
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  // 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 今日の記録を取得
  useEffect(() => {
    fetchTodayRecords();
  }, []);

  const fetchTodayRecords = async () => {
    try {
      const response = await fetch("/api/attendance/today");
      if (response.ok) {
        const records = await response.json();
        setTodayRecords(records);
      }
    } catch (error) {
      console.error("記録の取得に失敗しました:", error);
    }
  };

  const punch = async (type: string) => {
    setIsLoading(true);
    setStatus("");
    
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const result = await response.json();
        setStatus(`「${type}」を記録しました (${result.timestamp})`);
        fetchTodayRecords(); // 記録を再取得
      } else {
        setStatus("記録に失敗しました");
      }
    } catch (error) {
      setStatus("エラーが発生しました");
      console.error("打刻エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            勤怠管理システム
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-900/30"
          >
            ログアウト
          </button>
        </div>
        
        {/* 現在時刻表示 */}
        <div className="text-center mb-8 bg-slate-800/50 rounded-lg p-6 border border-slate-600">
          <div className="text-5xl font-mono font-bold text-cyan-400 mb-3 tracking-wider">
            {currentTime.toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="text-lg text-slate-300 font-medium">
            {currentTime.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
        </div>

        {/* 打刻ボタン */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <PunchButton
            type="出勤"
            onClick={() => punch("出勤")}
            disabled={isLoading}
            className="bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 border border-teal-600 shadow-lg shadow-teal-900/30"
          />
          <PunchButton
            type="退勤"
            onClick={() => punch("退勤")}
            disabled={isLoading}
            className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-slate-600 shadow-lg shadow-slate-900/30"
          />
          <PunchButton
            type="休憩開始"
            onClick={() => punch("休憩開始")}
            disabled={isLoading}
            className="bg-gradient-to-r from-violet-700 to-violet-800 hover:from-violet-600 hover:to-violet-700 border border-violet-600 shadow-lg shadow-violet-900/30"
          />
          <PunchButton
            type="休憩終了"
            onClick={() => punch("休憩終了")}
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 border border-indigo-600 shadow-lg shadow-indigo-900/30"
          />
        </div>

        {/* ステータス表示 */}
        {status && (
          <div className="mb-6 p-4 bg-teal-900/30 border border-teal-500/50 text-teal-300 rounded-lg text-center backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              <span className="font-medium">{status}</span>
            </div>
          </div>
        )}

        {/* 今日の記録 */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <div className="w-1 h-6 bg-cyan-400 rounded-full mr-3"></div>
            今日の記録 ({formatDate(new Date().toISOString())})
          </h2>
          {todayRecords.length === 0 ? (
            <p className="text-slate-400 text-center py-6 font-medium">まだ記録がありません</p>
          ) : (
            <div className="space-y-3">
              {todayRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:bg-slate-700/70 transition-colors"
                >
                  <span className="font-medium text-white">{record.type}</span>
                  <span className="text-cyan-300 font-mono text-sm">
                    {formatTime(record.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 画像ギャラリー */}
        <ImageCard className="mt-6" />
      </div>
    </div>
  );
}
