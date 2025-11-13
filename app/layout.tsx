'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setReady(true), 20)
  }, [])

  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* Navigation Bar */}
        <nav className="w-full px-6 py-4 bg-black/40 backdrop-blur-md border-b border-gray-800 flex justify-between items-center fixed top-0 left-0 z-50">
          <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition">
            Manchu Text Project
          </Link>

          <div className="flex gap-6 text-lg">
            <Link href="/" className="hover:text-blue-400 transition">Home</Link>
            <Link href="/documents/id" className="hover:text-blue-400 transition">Gallery</Link>
            <Link href="/search" className="hover:text-blue-400 transition">Search</Link>
            <Link href="/translate" className="hover:text-blue-400 transition">Translate</Link>
          </div>
        </nav>

        {/* Page Fade Wrapper */}
        <div className={`fade-wrapper ${ready ? 'ready' : ''}`}>
          <div className="pt-24"> 
            {/* Push content below navbar */}
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
