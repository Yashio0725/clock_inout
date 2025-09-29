"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Michroma, Orbitron } from 'next/font/google';

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

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // 認証成功時はメインページにリダイレクト
        router.push("/");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "認証に失敗しました");
      }
    } catch (error) {
      setError("エラーが発生しました");
      console.error("ログインエラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold text-white mb-2 tracking-wide ${michroma.className}`}>
              Attendance Management System
            </h1>
            <p className={`text-slate-400 ${orbitron.className}`}>Please enter your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className={`block text-sm font-medium text-slate-300 mb-2 ${orbitron.className}`}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Enter password"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-300 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className={`font-medium ${orbitron.className}`}>{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-900/30 disabled:shadow-none disabled:cursor-not-allowed ${orbitron.className}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className={orbitron.className}>Authenticating...</span>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className={`text-xs text-slate-500 ${orbitron.className}`}>
              This system requires authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
