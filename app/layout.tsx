'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const titleColor =
  pathname.startsWith('/search') ? 'text-rose-200' :
  pathname.startsWith('/translate') ? 'text-cyan-200' :
  pathname.startsWith('/documents') ? 'text-green-200' :
  'text-blue-300' // default (homepage)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 🎨 Dynamic background depending on page
  const navColor =
    pathname.startsWith('/search')
      ? 'bg-rose-600'
      : pathname.startsWith('/translate')
      ? 'bg-gradient-to-r from-indigo-700 via-cyan-600 to-blue-400'
      : pathname.startsWith('/documents')
      ? 'bg-green-700'
      : 'bg-black/40 backdrop-blur-md'  // default for homepage

  return (
    <html lang="en">
      <body className="text-white">

        {/* NAVIGATION BAR */}
        <nav className={`w-full px-6 py-4 border-b border-gray-800 fixed top-0 left-0 z-50 ${navColor}`}>
          <div className="flex justify-between items-center">
            <Link href="/" className={`text-2xl font-bold transition ${titleColor} hover:opacity-80`}>
              Manchu Text Project
            </Link>

            <div className="flex gap-6 text-lg">
              <Link href="/" className="hover:text-blue-200 transition">Home</Link>
              <Link href="/search" className="hover:text-blue-200 transition">Search</Link>
              <Link href="/documents/id" className="hover:text-blue-200 transition">Gallery</Link>
              <Link href="/translate" className="hover:text-blue-200 transition">Translate</Link>
            </div>
          </div>
        </nav>

        <div className="pt-12">
          <AnimatePresence mode="wait">
            {isMounted && (
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 0}}
                animate={{ opacity: 1, y: 10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </body>
    </html>
  )
}
