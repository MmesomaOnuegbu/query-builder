// store/query-store.ts
import { create } from 'zustand'
import { Group, Rule, QueryNode, Preset } from '../types/query'
import {
  addNode,
  removeNode,
  updateRule,
  updateGroup,
  reorderChildren,
  createRule,
  createGroup,
  createRootGroup,
} from '@/lib/recursive-utils'
import { mockSchema } from '../mock/schema'


const HISTORY_LIMIT = 30

type QueryStore = {
  // ── State ──────────────────────────────────────────────────────
  root:          Group
  history:       Group[]
  future:        Group[]        // for redo
  savedPresets:  Preset[]
  isExecuting:   boolean
  activePreview: 'sql' | 'mongo'

  // ── Rule actions ───────────────────────────────────────────────
  addRule:       (parentId: string) => void
  removeRule:    (ruleId: string)   => void
  updateRule:    (ruleId: string, updates: Partial<Rule>) => void

  // ── Group actions ──────────────────────────────────────────────
  addGroup:      (parentId: string) => void
  removeGroup:   (groupId: string)  => void
  updateGroup:   (groupId: string, updates: Partial<Group>) => void
  toggleCollapse:(groupId: string)  => void
  reorder:       (groupId: string, fromIndex: number, toIndex: number) => void

  // ── Query actions ──────────────────────────────────────────────
  resetQuery:    () => void
  setExecuting:  (val: boolean) => void
  setPreview:    (val: 'sql' | 'mongo') => void

  // ── History actions ────────────────────────────────────────────
  undo:          () => void
  redo:          () => void
  canUndo:       () => boolean
  canRedo:       () => boolean

  // ── Preset actions ─────────────────────────────────────────────
  savePreset:    (name: string) => void
  loadPreset:    (presetId: string) => void
  deletePreset:  (presetId: string) => void

  // ── Import/export ──────────────────────────────────────────────
  exportQuery:   () => string
  importQuery:   (json: string) => { success: boolean; error?: string }
}

// ── Helper — push to history before every mutation ───────────────
function pushHistory(history: Group[], current: Group): Group[] {
  const next = [...history, current]
  if (next.length > HISTORY_LIMIT) next.shift()
  return next
}

// ── Store ────────────────────────────────────────────────────────
export const useQueryStore = create<QueryStore>((set, get) => ({
  root:          createRootGroup(),
  history:       [],
  future:        [],
  savedPresets:  [],
  isExecuting:   false,
  activePreview: 'sql',

  // ── Rule actions ───────────────────────────────────────────────
  addRule: (parentId) => set(state => {
    const firstField = Object.keys(mockSchema)[0]
    const rule = createRule(firstField)
    return {
      root:    addNode(state.root, parentId, rule),
      history: pushHistory(state.history, state.root),
      future:  [],
    }
  }),

  removeRule: (ruleId) => set(state => ({
    root:    removeNode(state.root, ruleId),
    history: pushHistory(state.history, state.root),
    future:  [],
  })),

  updateRule: (ruleId, updates) => set(state => ({
    root:    updateRule(state.root, ruleId, updates),
    history: pushHistory(state.history, state.root),
    future:  [],
  })),

  // ── Group actions ──────────────────────────────────────────────
  addGroup: (parentId) => set(state => {
    const group = createGroup()
    return {
      root:    addNode(state.root, parentId, group),
      history: pushHistory(state.history, state.root),
      future:  [],
    }
  }),

  removeGroup: (groupId) => set(state => ({
    root:    removeNode(state.root, groupId),
    history: pushHistory(state.history, state.root),
    future:  [],
  })),

  updateGroup: (groupId, updates) => set(state => ({
    root:    updateGroup(state.root, groupId, updates),
    history: pushHistory(state.history, state.root),
    future:  [],
  })),

  toggleCollapse: (groupId) => set(state => {
    const findGroup = (node: QueryNode): Group | undefined => {
      if (node.type === 'group') {
        if (node.id === groupId) return node
        for (const child of node.children) {
          const found = findGroup(child)
          if (found) return found
        }
      }
    }
    const group = findGroup(state.root)
    if (!group) return state
    return {
      root: updateGroup(state.root, groupId, { collapsed: !group.collapsed }),
    }
  }),

  reorder: (groupId, fromIndex, toIndex) => set(state => ({
    root:    reorderChildren(state.root, groupId, fromIndex, toIndex),
    history: pushHistory(state.history, state.root),
    future:  [],
  })),

  // ── Query actions ──────────────────────────────────────────────
  resetQuery: () => set(state => ({
    root:    createRootGroup(),
    history: pushHistory(state.history, state.root),
    future:  [],
  })),

  setExecuting: (val) => set({ isExecuting: val }),
  setPreview:   (val) => set({ activePreview: val }),

  // ── History ────────────────────────────────────────────────────
  undo: () => set(state => {
    if (state.history.length === 0) return state
    const history = [...state.history]
    const previous = history.pop()!
    return {
      root:    previous,
      history,
      future:  [state.root, ...state.future],
    }
  }),

  redo: () => set(state => {
    if (state.future.length === 0) return state
    const future = [...state.future]
    const next = future.shift()!
    return {
      root:    next,
      history: pushHistory(state.history, state.root),
      future,
    }
  }),

  canUndo: () => get().history.length > 0,
  canRedo: () => get().future.length > 0,

  // ── Presets ────────────────────────────────────────────────────
  savePreset: (name) => set(state => ({
    savedPresets: [
      ...state.savedPresets,
      {
        id:        crypto.randomUUID(),
        name,
        query:     state.root,
        createdAt: new Date().toISOString(),
      },
    ],
  })),

  loadPreset: (presetId) => set(state => {
    const preset = state.savedPresets.find(p => p.id === presetId)
    if (!preset) return state
    return {
      root:    preset.query,
      history: pushHistory(state.history, state.root),
      future:  [],
    }
  }),

  deletePreset: (presetId) => set(state => ({
    savedPresets: state.savedPresets.filter(p => p.id !== presetId),
  })),

  // ── Import/export ──────────────────────────────────────────────
  exportQuery: () => JSON.stringify(get().root, null, 2),

  importQuery: (json) => {
    try {
      const parsed = JSON.parse(json)
      // basic validation
      if (!parsed.id || parsed.type !== 'group' || !Array.isArray(parsed.children)) {
        return { success: false, error: 'Invalid query format' }
      }
      set(state => ({
        root:    parsed as Group,
        history: pushHistory(state.history, state.root),
        future:  [],
      }))
      return { success: true }
    } catch {
      return { success: false, error: 'Invalid JSON' }
    }
  },
}))