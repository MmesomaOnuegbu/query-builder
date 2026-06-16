// hooks/useQueryBuilder.ts
import { useMemo } from 'react'
import { useQueryStore } from '../store/query-store'
import { validateQuery } from '@/lib/query-validator'
import { generateSQL, generateMongo } from '@/lib/query-generator'
import { executeQuery } from '@/lib/query-executor'
import { mockData } from '../mock/data'
import { mockSchema } from '../mock/schema'

export function useQueryBuilder() {
  const store = useQueryStore()

  // ── Derived state ─────────────────────────────────────────────
  // these only recompute when root changes
  const validation = useMemo(
    () => validateQuery(store.root, mockSchema),
    [store.root]
  )

  const sqlPreview = useMemo(
    () => generateSQL(store.root),
    [store.root]
  )

  const mongoPreview = useMemo(
    () => JSON.stringify(generateMongo(store.root), null, 2),
    [store.root]
  )

  const results = useMemo(
    () => executeQuery(store.root, mockData),
    [store.root]
  )

  const activePreviewText = store.activePreview === 'sql'
    ? sqlPreview
    : mongoPreview

  // ── Return everything components need ─────────────────────────
  return {
    // state
    root:             store.root,
    isExecuting:      store.isExecuting,
    activePreview:    store.activePreview,
    savedPresets:     store.savedPresets,
    canUndo:          store.canUndo(),
    canRedo:          store.canRedo(),

    // derived
    validation,
    sqlPreview,
    mongoPreview,
    activePreviewText,
    results,
    resultCount:      results.length,
    totalCount:       mockData.length,
    isValid:          validation.valid,

    // rule actions
    addRule:          store.addRule,
    removeRule:       store.removeRule,
    updateRule:       store.updateRule,

    // group actions
    addGroup:         store.addGroup,
    removeGroup:      store.removeGroup,
    updateGroup:      store.updateGroup,
    toggleCollapse:   store.toggleCollapse,
    reorder:          store.reorder,

    // query actions
    resetQuery:       store.resetQuery,
    setPreview:       store.setPreview,

    // history
    undo:             store.undo,
    redo:             store.redo,

    // presets
    savePreset:       store.savePreset,
    loadPreset:       store.loadPreset,
    deletePreset:     store.deletePreset,

    // import/export
    exportQuery:      store.exportQuery,
    importQuery:      store.importQuery,

    // schema
    schema:           mockSchema,
  }
}