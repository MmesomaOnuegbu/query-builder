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
    <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto p-4">

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold">Query Builder</h1>

        <div className="flex items-center gap-2 flex-wrap">
          {/* undo/redo */}
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1.5 text-xs rounded border border-border
                       disabled:opacity-40 hover:bg-muted transition-colors"
          >
            ↩ Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1.5 text-xs rounded border border-border
                       disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Redo ↪
          </button>

          {/* save preset */}
          <button
            type="button"
            onClick={handleSavePreset}
            className="px-3 py-1.5 text-xs rounded border border-border
                       hover:bg-muted transition-colors"
          >
            Save Preset
          </button>

          {/* export */}
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-1.5 text-xs rounded border border-border
                       hover:bg-muted transition-colors"
          >
            Export JSON
          </button>

          {/* import */}
          <button
            type="button"
            onClick={handleImport}
            className="px-3 py-1.5 text-xs rounded border border-border
                       hover:bg-muted transition-colors"
          >
            Import JSON
          </button>

          {/* reset */}
          <button
            type="button"
            onClick={resetQuery}
            className="px-3 py-1.5 text-xs rounded border border-red-300
                       text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30
                       transition-colors"
          >
            Reset
          </button>
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
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(resultCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}