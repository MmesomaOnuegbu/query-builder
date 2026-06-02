'use client'
import { useState } from 'react'
import { Moon, Sun, Search, Plus, Database, Settings, Menu, X } from 'lucide-react'
import QueryBuilder from '@/components/query-builder/QueryBuilder'
import ResultsTable from '@/components/results/ResultsTable'
import { useQueryBuilder } from '@/hooks/useQueryBuilder'

export default function AppContent() {
  const [dark, setDark] = useState(false)
  const [activeNav, setActiveNav] = useState('builder')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { results } = useQueryBuilder()

  function toggleDark() {
    setDark(prev => {
      document.documentElement.classList.toggle('dark', !prev)
      return !prev
    })
  }

  const navItems = [
    { id: 'builder', label: 'Query Builder', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-card border-r border-border
          flex flex-col overflow-hidden z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header with Logo and Dark Toggle */}
        <div className="p-2.5 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              Q
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>
            <button
              type="button"
              onClick={toggleDark}
              className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    activeNav === item.id
                      ? 'bg-emerald-600 text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-border p-4 bg-muted/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Recent history</p>
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3">
              <p className="text-sm font-semibold text-foreground">Last saved query</p>
              <p className="text-xs text-muted-foreground mt-1">Updated 5 minutes ago</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-3">
              <p className="text-sm font-semibold text-foreground">Tips</p>
              <p className="text-xs text-muted-foreground mt-1">Use nested groups to combine AND and OR filters clearly.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold flex-1">
              {navItems.find(item => item.id === activeNav)?.label}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {activeNav === 'builder' && (
            <div className="flex flex-col gap-6">
              <QueryBuilder />
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Results</h2>
                <ResultsTable data={results} />
              </div>
            </div>
          )}
          
          {activeNav === 'settings' && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Settings coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}