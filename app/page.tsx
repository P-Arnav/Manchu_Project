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
  return (
    <main className="p-8 text-white min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-6">
          Manchu Text Database
        </h1>

        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          This project is a digital resource dedicated to the preservation and study of
          the <strong>Manchu language</strong>. It integrates scanned manuscripts,
          transliterated Latin text, and English translations into an accessible,
          searchable online database.
          <br /><br />
          The goal is to support linguistic research, cultural preservation, and
          computational translation efforts through an open-source platform built with
          <span className="text-blue-300"> Supabase</span>,{' '}
          <span className="text-blue-300"> Next.js</span>, and{' '}
          <span className="text-blue-300"> DeepSeek API</span>.
        </p>

        {/* Manchu Blog link section */}
        <div className="mb-10">
          <a
            href="https://manjurist.blogspot.com/p/whats-where-in-manchu-digitalized-texts.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gray-800 border border-blue-500 text-blue-300 hover:bg-blue-700 hover:text-white px-6 py-3 rounded-lg text-lg font-medium transition"
          >
            📚 Explore Manchu Digitalized Texts
          </a>
          <p className="text-gray-500 text-sm mt-2">
            External link curated by <em>Manjurist Blogspot</em> — a rich index of scanned and digital Manchu materials.
          </p>
        </div>

        <div className="border-t border-gray-700 my-8"></div>

        <h2 className="text-3xl font-semibold mb-4">Translation System</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          The translation component is powered by the
          <span className="text-yellow-400 font-semibold"> DeepSeek API</span>, which provides
          advanced large language models capable of multilingual reasoning and
          translation.
          <br /><br />
          The system uses DeepSeek’s transformer-based API to process
          <em> Manchu → Latin → English</em> conversions, handling both transliteration
          and semantic translation stages.
          This enables accurate alignment between historical Manchu script, its
          phonetic Latin rendering, and modern English interpretations.
        </p>

        <a
          href="https://platform.deepseek.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-lg font-medium transition"
        >
          🔗 Visit DeepSeek API
        </a>

        <div className="mt-10 text-center">
        </div>
      </div>
    </main>
  )
}
