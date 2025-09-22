import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '勤怠管理システム',
  description: '外部オフィス従業員の出退勤管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold text-white tracking-wide">勤怠管理システム</h1>
                <nav className="space-x-4">
                  <a href="/" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">入力画面</a>
                  <a href="/admin" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">管理画面</a>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
