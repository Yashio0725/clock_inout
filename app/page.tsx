"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Michroma, Orbitron } from 'next/font/google';
import PunchButton from "@/components/PunchButton";
import ImageCard from "@/components/ImageCard";

const michroma = Michroma({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const orbitron = Orbitron({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface AttendanceRecord {
  id: string;
  type: string;
  timestamp: string;
  date: string;
  comment?: string;
}

export default function PunchPage() {
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [comment, setComment] = useState("");

  // 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // マウント後にのみ動的な時間/日付を描画
  useEffect(() => {
    setMounted(true);
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
      console.error("Failed to fetch records:", error);
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
        setStatus(`"${type}" recorded successfully (${result.timestamp})`);
        fetchTodayRecords(); // Refetch records
      } else {
        setStatus("Recording failed");
      }
    } catch (error) {
      setStatus("An error occurred");
      console.error("Punch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendComment = async () => {
    if (!comment.trim()) {
      setStatus("Please enter a comment");
      return;
    }

    setIsLoading(true);
    setStatus("");
    
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          type: "Comment", 
          comment: comment.trim() 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setStatus(`Comment recorded successfully (${result.timestamp})`);
        setComment("");
        fetchTodayRecords(); // Refetch records
      } else {
        const errorData = await response.json();
        setStatus(errorData.error || "Comment recording failed");
      }
    } catch (error) {
      setStatus("An error occurred");
      console.error("Comment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    // UTC時刻をそのまま日本時間として表示
    const date = new Date(timestamp);
    const utcTime = date.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS部分を取得
    return utcTime;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateEnglish = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "short",
      day: "numeric",
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
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold text-white tracking-wide ${michroma.className}`}>
            Attendance Management System
          </h1>
          <button
            onClick={handleLogout}
            className={`px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30 border border-orange-400 ${orbitron.className}`}
          >
            Logout
          </button>
        </div>
        
        {/* Current Time Display */}
        <div className="text-center mb-8 bg-slate-800/50 rounded-lg p-6 border border-slate-600">
          <div
            suppressHydrationWarning
            className={`text-5xl font-bold text-cyan-400 mb-3 tracking-wider ${orbitron.className}`}
          >
            {mounted
              ? currentTime.toLocaleTimeString("ja-JP", {
                  timeZone: "Asia/Tokyo",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })
              : ""}
          </div>
          <div
            suppressHydrationWarning
            className={`text-lg text-slate-300 font-medium ${orbitron.className}`}
          >
            {mounted
              ? currentTime.toLocaleDateString("ja-JP", {
                  timeZone: "Asia/Tokyo",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })
              : ""}
          </div>
        </div>

        {/* Comment Input */}
        <div className="mb-8">
          <label className={`block text-sm font-medium text-slate-200 mb-2 ${orbitron.className}`}>
            Comment
          </label>
          <div className="flex gap-2">
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Enter your comment here..."
              maxLength={200}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
              rows={3}
            />
            <button
              onClick={sendComment}
              disabled={isLoading || !comment.trim()}
              className={`px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/30 border border-cyan-400 ${orbitron.className}`}
            >
              Send
            </button>
          </div>
        </div>

        {/* Punch Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <PunchButton
            type="Clock In"
            onClick={() => punch("Clock In")}
            disabled={isLoading}
            className={`bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 border border-slate-400 shadow-lg shadow-slate-500/30 ${orbitron.className}`}
          />
          <PunchButton
            type="Clock Out"
            onClick={() => punch("Clock Out")}
            disabled={isLoading}
            className={`bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 border border-slate-500 shadow-lg shadow-slate-600/30 ${orbitron.className}`}
          />
          <PunchButton
            type="Away From Keyboard"
            onClick={() => punch("Away From Keyboard")}
            disabled={isLoading}
            className={`bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 border border-slate-400 shadow-lg shadow-slate-500/30 ${orbitron.className}`}
          />
          <PunchButton
            type="Back"
            onClick={() => punch("Back")}
            disabled={isLoading}
            className={`bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 border border-slate-500 shadow-lg shadow-slate-600/30 ${orbitron.className}`}
          />
        </div>

        {/* Status Display */}
        {status && (
          <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 rounded-lg text-center backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className={`font-medium ${orbitron.className}`}>{status}</span>
            </div>
          </div>
        )}

        {/* Today's Record */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600 backdrop-blur-sm">
          <h2
            suppressHydrationWarning
            className={`text-xl font-semibold text-white mb-4 flex items-center ${orbitron.className}`}
          >
            <div className="w-1 h-6 bg-cyan-400 rounded-full mr-3"></div>
            {`Today's Record (${mounted ? formatDateEnglish(new Date().toISOString()) : ""})`}
          </h2>
          {todayRecords.length === 0 ? (
            <p className={`text-slate-400 text-center py-6 font-medium ${orbitron.className}`}>No records yet</p>
          ) : (
            <div className="space-y-3">
              {todayRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:bg-slate-700/70 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    {record.type === "Comment" ? (
                      <div>
                        <span className={`font-medium text-white block ${orbitron.className}`}>
                          {record.comment}
                        </span>
                      </div>
                    ) : (
                      <span className={`font-medium text-white ${orbitron.className}`}>
                        {record.type}
                      </span>
                    )}
                  </div>
                  <span className={`text-cyan-300 font-mono text-sm ${orbitron.className}`}>
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
