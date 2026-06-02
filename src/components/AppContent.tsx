'use client'
import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import QueryBuilder from '@/components/query-builder/QueryBuilder'
import ResultsTable from '@/components/results/ResultsTable'
import { useQueryBuilder } from '@/hooks/useQueryBuilder'

export default function AppContent() {
  const [dark, setDark] = useState(false)
  const { results } = useQueryBuilder()

  function toggleDark() {
    setDark(prev => {
      document.documentElement.classList.toggle('dark', !prev)
      return !prev
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">Q</div>
            <span className="font-semibold text-sm">QueryBuilder</span>
          </div>
          <button type="button" onClick={toggleDark} className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        <QueryBuilder />
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Results</h2>
          <ResultsTable data={results} />
        </div>
      </main>
    </div>
  )
}