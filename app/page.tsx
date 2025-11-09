'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type ManchuRow = {
  id: number
  english_text: string
  latin_text: string
  manchu_text: string
}

export default function Home() {
  const [rows, setRows] = useState<ManchuRow[]>([])

  useEffect(() => {
    async function loadData() {
      // fetch only the columns we care about
      const { data, error } = await supabase
        .from('manchu_entries')
        .select('id, manchu_text, latin_text, english_text')

      if (error) console.error('Error loading data:', error)
      else setRows(data || [])
    }
    loadData()
  }, [])

  return (
    <main className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Manchu Text Database
      </h1>

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
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.id} className="odd:bg-gray-900 even:bg-gray-800">
                  <td className="border border-gray-700 px-3 py-2 font-manchu text-lg">
                    {row.manchu_text}
                  </td>
                  <td className="border border-gray-700 px-3 py-2 italic">
                    {row.latin_text}
                  </td>
                  <td className="border border-gray-700 px-3 py-2">
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
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
