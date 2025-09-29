import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter, Michroma, Orbitron } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const michroma = Michroma({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})
const orbitron = Orbitron({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Attendance Management System',
  description: 'Attendance tracking system for remote office employees',
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
                <h1 className={`text-2xl font-bold text-white tracking-wide ${michroma.className}`}>Attendance Management System</h1>
                <nav className="space-x-4">
                  <Link href="/" className={`text-cyan-400 hover:text-cyan-300 font-medium transition-colors ${orbitron.className}`}>Punch</Link>
                  <Link href="/admin" className={`text-cyan-400 hover:text-cyan-300 font-medium transition-colors ${orbitron.className}`}>Admin</Link>
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
