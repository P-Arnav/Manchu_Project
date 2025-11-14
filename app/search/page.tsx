'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'
import './highlight.css'

type Entry = {
  id: number
  manchu_text: string
  latin_text: string
  english_text: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const [allTokens, setAllTokens] = useState<string[]>([])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('manchu_entries')
      .select('*')
      .or(
        `english_text.ilike.%${query}%,latin_text.ilike.%${query}%,manchu_text.ilike.%${query}%`
      )

    if (error) console.error(error)
    else setResults(data || [])

    setLoading(false)
  }

  function handleExport() {
    if (results.length === 0) {
      alert('No results to export.')
      return
    }

    const header = ['Manchu', 'Latin', 'English']
    const rows = results.map(r => [
      `"${r.manchu_text.replace(/"/g, '""')}"`,
      `"${r.latin_text.replace(/"/g, '""')}"`,
      `"${r.english_text.replace(/"/g, '""')}"`,
    ])

    const csvContent =
      [header.join(','), ...rows.map(r => r.join(','))].join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `manchu_dataset_${query || 'all'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const tokens: string[] = []
    results.forEach(row => {
      row.manchu_text.split(/\s+/).forEach((_, i) => tokens.push(`${row.id}-${i}`))
      row.latin_text.split(/\s+/).forEach((_, i) => tokens.push(`${row.id}-${i}`))
    })
    setAllTokens(tokens)
  }, [results])

  function tokenize(text: string, lang: 'latin' | 'manchu', rowId: number) {
    return text.split(/\s+/).map((word, i) => {
      const id = `${rowId}-${i}`
      return (
        <span
          key={id}
          data-id={id}
          className={`cursor-pointer ${
            activeWord === id ? 'highlight' : ''
          }`}
          onClick={() => {
            setActiveWord(id)
            scrollWordIntoView(id)
          }}
        >
          {word + ' '}
        </span>
      )
    })
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!activeWord || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return

      const [rowId] = activeWord.split('-')
      const rowTokens = allTokens.filter(t => t.startsWith(`${rowId}-`))
      const currentIndex = rowTokens.indexOf(activeWord)

      let newIndex = currentIndex
      if (e.key === 'ArrowRight' && currentIndex < rowTokens.length - 1) newIndex++
      if (e.key === 'ArrowLeft' && currentIndex > 0) newIndex--

      if (newIndex !== currentIndex) {
        const next = rowTokens[newIndex]
        setActiveWord(next)
        scrollWordIntoView(next)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeWord, allTokens])

  function scrollWordIntoView(id: string) {
    const el = document.querySelector(`[data-id="${id}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <main
      className="
        min-h-screen 
        bg-gradient-to-b from-white to-rose-200 
        text-gray-900 
        p-8
      "
    >
      <div className="max-w-5xl mx-auto">

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-rose-600 drop-shadow mb-10">
          Search Entries
        </h1>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row justify-center gap-3 mb-10"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Manchu, Latin, or English..."
            className="w-full sm:w-2/3 p-3 rounded-xl border border-rose-300 shadow bg-white focus:ring-2 focus:ring-rose-400 outline-none"
          />

          <button
            type="submit"
            className="px-6 py-3 bg-rose-600 text-white rounded-xl shadow hover:bg-rose-700 transition"
          >
            Search
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <p className="text-center text-rose-700 font-medium">
            Searching...
          </p>
        )}

        {/* Table */}
        <div className="overflow-hidden shadow-xl rounded-2xl border border-rose-300 bg-white">
          <table className="w-full text-center rounded-2xl">
            <thead className="bg-rose-600 text-white sticky top-0">
              <tr>
                <th className="px-4 py-3">Manchu</th>
                <th className="px-4 py-3">Latin</th>
                <th className="px-4 py-3">English</th>
              </tr>
            </thead>

            <tbody>
              {results.length > 0 ? (
                results.map(row => (
                  <tr
                    key={row.id}
                    className="odd:bg-rose-50 even:bg-rose-100"
                  >
                    <td className="px-4 py-3 font-serif">
                      {tokenize(row.manchu_text, 'manchu', row.id)}
                    </td>
                    <td className="px-4 py-3 italic">
                      {tokenize(row.latin_text, 'latin', row.id)}
                    </td>
                    <td className="px-4 py-3">
                      {row.english_text}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-6 text-rose-600 font-medium">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-between mt-10">

          <button
            onClick={handleExport}
            className="px-5 py-3 bg-rose-700 text-white rounded-xl shadow hover:bg-rose-800 transition cursor-pointer"
          >
            Export Dataset
          </button>

          <Link
            href="/"
            className="px-5 py-3 bg-gray-700 text-white rounded-xl shadow hover:bg-gray-800 transition"
          >
            ← Back to Home
          </Link>

        </div>
      </div>
    </main>
  )
}
