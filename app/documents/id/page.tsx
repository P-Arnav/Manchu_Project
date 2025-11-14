'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import Link from 'next/link'

type TranslatedEntry = {
  id: number
  image_url: string
  manchu_text: string
  latin_text: string
  english_text: string | null
  source?: string | null
}

type UntranslatedEntry = {
  id: number
  image_url: string
  description: string | null
  source_link: string | null
}

export default function ViewGallery() {
  const [translated, setTranslated] = useState<TranslatedEntry[]>([])
  const [untranslated, setUntranslated] = useState<UntranslatedEntry[]>([])
  const [filter, setFilter] = useState<'translated' | 'untranslated'>('translated')
  const [selected, setSelected] = useState<TranslatedEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [tPage, setTPage] = useState(1)
  const [uPage, setUPage] = useState(1)
  const perPage = 6

  useEffect(() => {
    async function fetchEntries() {
      setLoading(true)

      const [translatedRes, untranslatedRes] = await Promise.all([
        supabase
          .from('manchu_entries')
          .select('id, image_url, manchu_text, latin_text, english_text, source')
          .order('id', { ascending: true }),
        supabase
          .from('manchu_entries_untranslated')
          .select('id, image_url, source_link, description')
          .order('id', { ascending: true }),
      ])

      if (translatedRes.error) console.error(translatedRes.error)
      else setTranslated(translatedRes.data || [])

      if (untranslatedRes.error) console.error(untranslatedRes.error)
      else setUntranslated(untranslatedRes.data || [])

      setLoading(false)
    }

    fetchEntries()
  }, [])

  {/* Pagination setup */}
  const tTotalPages = Math.ceil(translated.length / perPage)
  const uTotalPages = Math.ceil(untranslated.length / perPage)
  const tStart = (tPage - 1) * perPage
  const uStart = (uPage - 1) * perPage
  const tVisible = translated.slice(tStart, tStart + perPage)
  const uVisible = untranslated.slice(uStart, uStart + perPage)

  const totalPages = filter === 'translated' ? tTotalPages : uTotalPages
  const page = filter === 'translated' ? tPage : uPage

  const nextPage = () =>
    filter === 'translated'
      ? setTPage((p) => Math.min(p + 1, tTotalPages))
      : setUPage((p) => Math.min(p + 1, uTotalPages))

  const prevPage = () =>
    filter === 'translated'
      ? setTPage((p) => Math.max(p - 1, 1))
      : setUPage((p) => Math.max(p - 1, 1))

  const Pagination = () => (
    <div className="flex justify-center items-center gap-6 my-6">
      <button
        onClick={prevPage}
        disabled={page === 1}
        className={`px-4 py-2 rounded ${
          page === 1
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-gray-800 text-blue-300 hover:bg-gray-700'
        }`}
      >
        ◀ Prev
      </button>

      <span className="text-gray-400">
        Page <span className="text-blue-400 font-semibold">{page}</span> /{' '}
        <span className="text-gray-300">{totalPages}</span>
      </span>

      <button
        onClick={nextPage}
        disabled={page === totalPages}
        className={`px-4 py-2 rounded ${
          page === totalPages
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-gray-800 text-blue-300 hover:bg-gray-700'
        }`}
      >
        Next ▶
      </button>
    </div>
  )

  return (
    <main className="p-8 min-h-screen text-white bg-gradient-to-b from-[#001a3d] to-[#000814]">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">
        Manchu Text Gallery
      </h1>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setFilter('translated')}
          className={`px-5 py-2 rounded transition ${
            filter === 'translated'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
           Translated
        </button>
        <button
          onClick={() => setFilter('untranslated')}
          className={`px-5 py-2 rounded transition ${
            filter === 'untranslated'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
           Untranslated
        </button>
      </div>

      {!loading && (filter === 'translated' ? translated.length : untranslated.length) > 0 && (
        <Pagination />
      )}

      {/* Main Display */}
      {loading ? (
        <p className="text-center text-gray-400">Loading entries...</p>
      ) : filter === 'translated' ? (
        <>
          {/* Regular Translated Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center mb-10">
            {tVisible.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl overflow-hidden border border-blue-900/40 
                          bg-blue-950/30 shadow-md hover:shadow-blue-500/40 
                          transition duration-200 backdrop-blur-sm w-64"
              >
                <button
                  onClick={() => setSelected(entry)}
                  className="w-full focus:outline-none cursor-pointer"
                >
                  <img
                    src={entry.image_url}
                    alt="Manchu manuscript"
                    className="w-full aspect-square object-cover rounded-lg 
                              border border-blue-900/50 shadow-sm hover:shadow-blue-500/20 
                              transition"
                  />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-gray-200 text-sm font-medium transition-opacity">
                    Click to view translation
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Divider */}
            <h2 className="text-2xl font-semibold text-blue-300 mb-4 text-center flex items-center justify-center gap-2">
              <span>🔗</span> Grouped by Shared Source
            </h2>

            {/* Group redundant links with source thumbnail */}
            <div className="flex flex-col gap-6 mt-4">
              {Object.entries(
                translated.reduce((acc: Record<string, TranslatedEntry[]>, entry) => {
                  if (entry.source && entry.source.trim() !== '') {
                    const link = entry.source.trim()
                    if (!acc[link]) acc[link] = []
                    acc[link].push(entry)
                  }
                  return acc
                }, {})
              )
                .filter(([_, entries]) => entries.length > 1) 
                .map(([link, entries]) => (
                  <div
                    key={link}
                    className="bg-blue-950/40 border border-blue-900 rounded-xl 
                              p-6 shadow-lg hover:shadow-blue-500/30 
                              transition backdrop-blur-sm"
                  >
                    {/* Source thumbnail (from source) */}
                    <div className="flex justify-center mb-4">
                      <img
                        src={link}
                        alt="Source thumbnail"
                        className="max-h-[220px] rounded-xl shadow border border-blue-900/50 object-contain"
                      />
                    </div>

                    {/* List of entries that share this source */}
                    <ul className="list-disc list-inside text-gray-300 px-4">
                      {entries.map((entry) => (
                        <li key={entry.id} className="mb-1">
                          <span className="font-semibold text-gray-200">
                            Entry #{entry.id}:
                          </span>{' '}
                          {entry.english_text
                            ? entry.english_text.slice(0, 120) + '…'
                            : 'No English text.'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>

          {tTotalPages > 1 && <Pagination />}
        </>
      ) : (
        /* Untranslated */
        <>
          <div className="flex flex-col gap-6 mt-4">
            {uVisible.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col md:flex-row items-center md:items-start 
                          bg-blue-950/40 border border-blue-900 rounded-xl 
                          p-5 shadow-md hover:shadow-blue-500/20 
                          transition backdrop-blur-sm"
              >
                <div className="w-full md:w-1/2 flex justify-center">
                  <img
                    src={entry.image_url}
                    alt="Untranslated manuscript"
                    className="rounded-xl object-contain max-h-[300px] 
                              border border-blue-900/40 shadow-sm"
                  />
                </div>
                <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-6 text-center md:text-left">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    Untranslated Entry #{entry.id}
                  </h3>
                  <p className="text-gray-300 mb-3">
                    {entry.description ?? 'No description provided.'}
                  </p>
                  {entry.source_link && (
                    <a
                      href={entry.source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      View Source →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {uTotalPages > 1 && <Pagination />}
        </>
      )}

      {/* Modal for Translated Entries */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-blue-950/60 rounded-xl border border-blue-900 shadow-xl 
            backdrop-blur-md max-w-5xl w-full p-6 
            flex flex-col md:flex-row gap-6 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 left-0 right-0 text-center text-xl font-semibold text-blue-400">
              Entry #{selected.id}
            </div>

            <div className="flex-1 flex items-center justify-center mt-8 md:mt-0">
              <img
                src={selected.image_url}
                alt="Manchu manuscript"
                className="max-h-[80vh] w-auto rounded-lg shadow-lg border border-blue-900/50"
              />
            </div>

            <div className="flex-1 flex flex-col justify-center text-center md:text-left space-y-4 mt-8 md:mt-0">
              <p className="font-manchu text-lg leading-relaxed">
                {selected.manchu_text}
              </p>
              <p className="italic text-gray-300 leading-relaxed">
                {selected.latin_text}
              </p>
              <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                {selected.english_text}
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="text-center mt-10">
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
