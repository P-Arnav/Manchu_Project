import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Manchu Text Project',
  description: 'Digital Manchu Text Database',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* Sticky Navbar */}
        <header className="fixed top-0 left-0 w-full bg-gray-950/90 backdrop-blur-md border-b border-gray-800 shadow-md z-50">
          <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Left: Project Title */}
            <Link href="/" className="text-xl font-bold text-blue-400">
              Manchu Text Project
            </Link>

            {/* Center: Navigation */}
            <nav className="absolute left-1/2 -translate-x-1/2 flex gap-8 text-gray-300">
              <Link href="/" className="hover:text-blue-400 transition">Home</Link>
              <Link href="/documents/id" className="hover:text-blue-400 transition">Gallery</Link>
              <Link href="/search" className="hover:text-blue-400 transition">Search</Link>
              <Link href="/translate" className="hover:text-blue-400 transition">Translate</Link>
            </nav>
          </div>
        </header>
        <main className="pt-20">{children}</main>
      </body>
    </html>
  )
}
