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

  {/* Export results as CSV */}
  function handleExport() {
    if (results.length === 0) {
      alert('No results to export.')
      return
    }

    const header = ['Manchu', 'Latin', 'English']
    const rows = results.map(r => [
      `"${r.manchu_text.replace(/"/g, '""')}"`,
      `"${r.latin_text.replace(/"/g, '""')}"`,
      `"${r.english_text.replace(/"/g, '""')}"`
    ])
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `manchu_dataset_${query || 'all'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  {/* Collect all token IDs */}
  useEffect(() => {
    const tokens: string[] = []
    results.forEach((row) => {
      const manchuWords = row.manchu_text.split(/\s+/)
      const latinWords = row.latin_text.split(/\s+/)
      manchuWords.forEach((_, i) => tokens.push(`${row.id}-${i}`))
      latinWords.forEach((_, i) => tokens.push(`${row.id}-${i}`))
    })
    setAllTokens(tokens)
  }, [results])

  {/* ✅ Token rendering */}
  function tokenize(text: string, lang: 'latin' | 'manchu', rowId: number) {
    const words = text.split(/\s+/)
    return words.map((word, i) => (
      <span
        key={`${rowId}-${lang}-${i}`}
        data-id={`${rowId}-${i}`}
        className={`cursor-pointer ${activeWord === `${rowId}-${i}` ? 'highlight' : ''}`}
        onClick={() => {
          const id = `${rowId}-${i}`
          setActiveWord(id)
          scrollWordIntoView(id)
        }}
      >
        {word + ' '}
      </span>
    ))
  }

  {/* Arrow key navigation */}
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!allTokens.length) return
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return
      if (!activeWord) return
      e.preventDefault()

      const [rowId, , indexStr] = activeWord.split('-')
      const rowTokens = allTokens.filter(t => t.startsWith(`${rowId}-`))
      const currentIndex = rowTokens.indexOf(activeWord)
      let newIndex = currentIndex

      if (e.key === 'ArrowRight' && currentIndex < rowTokens.length - 1) newIndex++
      else if (e.key === 'ArrowLeft' && currentIndex > 0) newIndex--
      else return

      const next = rowTokens[newIndex]
      setActiveWord(next)
      scrollWordIntoView(next)
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeWord, allTokens])

  function scrollWordIntoView(id: string) {
    const el = document.querySelector(`[data-id="${id}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  return (
    <main className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Entries</h1>

      <form onSubmit={handleSearch} className="text-center mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Manchu, Latin, or English..."
          className="w-1/2 p-2 rounded bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/40 transition"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-center text-gray-400">Searching...</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-700 text-center">
          <thead className="bg-gray-800 text-gray-200">
            <tr>
              <th className="border border-gray-700 px-3 py-2">Manchu</th>
              <th className="border border-gray-700 px-3 py-2">Latin</th>
              <th className="border border-gray-700 px-3 py-2">English</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((row) => (
                <tr key={row.id} className="odd:bg-gray-900 even:bg-gray-800">
                  <td className="border border-gray-700 px-3 py-2 font-manchu text-lg leading-relaxed">
                    {tokenize(row.manchu_text, 'manchu', row.id)}
                  </td>
                  <td className="border border-gray-700 px-3 py-2 italic leading-relaxed">
                    {tokenize(row.latin_text, 'latin', row.id)}
                  </td>
                  <td className="border border-gray-700 px-3 py-2 text-gray-300 leading-relaxed">
                    {row.english_text}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="border border-gray-700 px-3 py-4 text-gray-400"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/*  Bottom row: Export (left) + Back (right) */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-green-300 font-medium transition cursor-pointer"
        >
           Export Dataset
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-blue-300 font-medium transition"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
