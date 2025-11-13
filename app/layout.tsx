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
        <header className="w-full bg-black/90 border-b border-gray-800 px-4 py-2">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* Left side (title) */}
            <Link href="/" className="text-2xl font-bold text-blue-400">
              Manchu Text Project
            </Link>

            {/* Right side (links) */}
            <nav className="flex gap-6 text-gray-300 justify-center sm:justify-end text-lg">
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
