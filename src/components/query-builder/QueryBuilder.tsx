// components/query-builder/QueryBuilder.tsx
'use client'

import { useQueryBuilder } from '@/hooks/useQueryBuilder'
import GroupNode    from './GroupNode'
import QueryPreview from './QueryPreview'

export default function QueryBuilder() {
  const {
    root,
    schema,
    validation,
    sqlPreview,
    mongoPreview,
    activePreview,
    results,
    resultCount,
    totalCount,
    canUndo,
    canRedo,
    addRule,
    addGroup,
    removeRule,
    removeGroup,
    updateRule,
    updateGroup,
    toggleCollapse,
    reorder,
    resetQuery,
    undo,
    redo,
    setPreview,
    savePreset,
    exportQuery,
    importQuery,
  } = useQueryBuilder()

  // ── Import handler ────────────────────────────────────────────
  function handleImport() {
    const json = prompt('Paste your query JSON:')
    if (!json) return
    const result = importQuery(json)
    if (!result.success) alert(`Import failed: ${result.error}`)
  }

  // ── Export handler ────────────────────────────────────────────
  function handleExport() {
    const json = exportQuery()
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'query.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Save preset handler ───────────────────────────────────────
  function handleSavePreset() {
    const name = prompt('Preset name:')
    if (!name) return
    savePreset(name)
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto p-2 md:p-4">

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="rounded-[1rem] border border-emerald-50 bg-emerald-50/5 dark:border-none p-6 shadow-sm ring-1 ring-emerald-100 mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold">Welcome</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Build structured filters with nested groups, clear AND/OR logic, and visible condition controls.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
          {/* undo/redo */}
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-emerald-300 dark:border-emerald-700
                       bg-emerald-50/10 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300
                       disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-100 dark:hover:bg-emerald-900/30 
                       transition-all duration-200"
          >
            ↩ Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-emerald-300 dark:border-emerald-700
                       bg-emerald-50/10 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300
                       disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-100 dark:hover:bg-emerald-900/30 
                       transition-all duration-200"
          >
            Redo ↪
          </button>

          {/* save preset */}
          <button
            type="button"
            onClick={handleSavePreset}
            className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-emerald-300 dark:border-emerald-700
                       bg-emerald-50/10 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300
                       hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-200"
          >
            Save Preset
          </button>

          {/* export */}
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-emerald-300 dark:border-emerald-700
                       bg-emerald-50/10 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300
                       hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-200"
          >
            Export JSON
          </button>

          {/* import */}
          <button
            type="button"
            onClick={handleImport}
            className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-emerald-300 dark:border-emerald-700
                       bg-emerald-50/10 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300
                       hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-200"
          >
            Import JSON
          </button>

          {/* reset */}
          <button
            type="button"
            onClick={resetQuery}
            className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-red-300 dark:border-red-700
                       bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300
                       hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

      {/* ── Validation banner ────────────────────────────────── */}
      {!validation.valid && validation.errors.length > 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 
                        dark:bg-red-950/20 px-4 py-2">
          <p className="text-xs font-semibold text-red-500 mb-1">
            {validation.errors.length} issue{validation.errors.length !== 1 ? 's' : ''} found
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {validation.errors.slice(0, 3).map(e => (
              <li key={e.nodeId} className="text-xs text-red-500">
                {e.message}
              </li>
            ))}
            {validation.errors.length > 3 && (
              <li className="text-xs text-red-400">
                +{validation.errors.length - 3} more...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* ── Group tree ───────────────────────────────────────── */}
      <div className="rounded-[1rem]  dark:bg-black/50 shadow-sm overflow-hidden">
        <GroupNode
          group={root}
          schema={schema}
          errors={validation.errors}
          depth={0}
          isRoot={true}
          onAddRule={addRule}
          onAddGroup={addGroup}
          onRemove={removeGroup}
          onUpdateRule={updateRule}
          onUpdateGroup={updateGroup}
          onToggleCollapse={toggleCollapse}
          onReorder={reorder}
        />
      </div>

      {/* ── Query preview ────────────────────────────────────── */}
      <QueryPreview
        sql={sqlPreview}
        mongo={mongoPreview}
        activePreview={activePreview}
        onSwitch={setPreview}
      />

      {/* ── Results summary ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 
                      rounded-lg border border-border bg-card">
        <span className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-semibold text-foreground">{resultCount}</span>
          {' '}of{' '}
          <span className="font-semibold text-foreground">{totalCount}</span>
          {' '}records
        </span>
        <div className="w-48 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${(resultCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}