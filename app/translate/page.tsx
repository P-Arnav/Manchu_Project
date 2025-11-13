'use client'

import { useState } from 'react'

export default function TranslatePage() {
  const [text, setText] = useState('')
  const [output, setOutput] = useState({ latin: '', english: '', manchu: '' })
  const [loading, setLoading] = useState(false)
  const [direction, setDirection] = useState<'manchu-to-english' | 'english-to-manchu'>('manchu-to-english')

  async function handleTranslate() {
    if (!text.trim()) return alert('Please enter text first.')
    setLoading(true)

    try {
      const prompt =
        direction === 'manchu-to-english'
          ? `
          You are a bilingual expert translator specialized in the Manchu language (ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ),
          trained in both the Möllendorff Latin transliteration system and English gloss translation.

          Your task:
          1. Transliterate the given Manchu text into Latin script (Möllendorff style), preserving spacing and diacritics.
          2. Translate it into natural, grammatical English while retaining historical tone and meaning.

          Output format must always be:
          Latin: <latin transliteration>
          English: <english translation>

          Do not add commentary or explanations.

          Text:
          ${text}
          `
          : `
          You are a bilingual expert translator specialized in the Manchu language (ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ),
          trained in both the Möllendorff Latin transliteration system and English gloss translation.

          Your task:
          1. Translate the given English text into classical Manchu script (ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ).
          2. Transliterate the Manchu translation into Möllendorff-style Latin.
          
          Output format must always be:
          Manchu: <manchu script>
          Latin: <latin transliteration>

          Do not include English again or commentary.

          English Text:
          ${text}
          `

      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await res.json()
      const result = data.choices?.[0]?.message?.content ?? ''

      if (direction === 'manchu-to-english') {
        const [latinLine, englishLine] = result
          .split('\n')
          .map((x: string) => x.replace(/^Latin:|English:/i, '').trim())
        setOutput({ latin: latinLine, english: englishLine, manchu: '' })
      } else {
        const [manchuLine, latinLine] = result
          .split('\n')
          .map((x: string) => x.replace(/^Manchu:|Latin:/i, '').trim())
        setOutput({ manchu: manchuLine, latin: latinLine, english: '' })
      }
    } catch (err) {
      console.error(err)
      alert('Error during translation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
        Manchu Translator
      </h1>

      {/* Translation direction selector */}
      <div className="flex justify-center mb-6">
        <select
          value={direction}
          onChange={(e) =>
            setDirection(e.target.value as 'manchu-to-english' | 'english-to-manchu')
          }
          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:ring focus:ring-blue-500"
        >
          <option value="manchu-to-english">Manchu → English + Latin</option>
          <option value="english-to-manchu">English → Manchu + Latin</option>
        </select>
      </div>

      {/* Input area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          direction === 'manchu-to-english'
            ? 'Enter Manchu text here...'
            : 'Enter English text here...'
        }
        className="w-full h-40 border border-gray-700 bg-gray-900 text-white p-4 rounded-md focus:ring focus:ring-blue-500"
      />

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition disabled:opacity-60"
      >
        {loading ? 'Translating…' : 'Translate'}
      </button>

      {/* Output Section */}
      {direction === 'manchu-to-english' && output.latin && (
        <div className="mt-8 bg-gray-900 border border-gray-700 p-6 rounded-lg space-y-3">
          <p>
            <strong className="text-blue-400">Latin:</strong> {output.latin}
          </p>
          <p>
            <strong className="text-green-400">English:</strong> {output.english}
          </p>
        </div>
      )}

      {direction === 'english-to-manchu' && output.manchu && (
        <div className="mt-8 bg-gray-900 border border-gray-700 p-6 rounded-lg space-y-3">
          <p className="text-3xl font-manchu leading-relaxed text-center text-white">
            {output.manchu}
          </p>
          <p>
            <strong className="text-blue-400">Latin:</strong> {output.latin}
          </p>
        </div>
      )}
    </main>
  )
}
