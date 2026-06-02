// lib/recursive-utils.ts

import { Group, QueryNode, Rule } from '@/types/query'
import { nanoid } from 'nanoid'

// ── Add a node to a group by parent id ──────────────────────────
export function addNode(tree: Group, parentId: string, node: QueryNode): Group {
  if (tree.id === parentId) {
    return { ...tree, children: [...tree.children, node] }
  }
  return {
    ...tree,
    children: tree.children.map(child =>
      child.type === 'group' ? addNode(child, parentId, node) : child
    ),
  }
}

// ── Remove a node by id ──────────────────────────────────────────
export function removeNode(tree: Group, nodeId: string): Group {
  return {
    ...tree,
    children: tree.children
      .filter(child => child.id !== nodeId)
      .map(child =>
        child.type === 'group' ? removeNode(child, nodeId) : child
      ),
  }
}

// ── Update a rule by id ──────────────────────────────────────────
export function updateRule(tree: Group, ruleId: string, updates: Partial<Rule>): Group {
  return {
    ...tree,
    children: tree.children.map(child => {
      if (child.type === 'rule' && child.id === ruleId) {
        return { ...child, ...updates }
      }
      if (child.type === 'group') {
        return updateRule(child, ruleId, updates)
      }
      return child
    }),
  }
}

// ── Update a group by id ─────────────────────────────────────────
export function updateGroup(tree: Group, groupId: string, updates: Partial<Group>): Group {
  if (tree.id === groupId) {
    return { ...tree, ...updates }
  }
  return {
    ...tree,
    children: tree.children.map(child =>
      child.type === 'group' ? updateGroup(child, groupId, updates) : child
    ),
  }
}

// ── Reorder children inside a group ─────────────────────────────
export function reorderChildren(tree: Group, groupId: string, fromIndex: number, toIndex: number): Group {
  if (tree.id === groupId) {
    const children = [...tree.children]
    const [moved] = children.splice(fromIndex, 1)
    children.splice(toIndex, 0, moved)
    return { ...tree, children }
  }
  return {
    ...tree,
    children: tree.children.map(child =>
      child.type === 'group' ? reorderChildren(child, groupId, fromIndex, toIndex) : child
    ),
  }
}

// ── Create a blank rule ──────────────────────────────────────────
export function createRule(field: string): Rule {
  return {
    id: nanoid(),
    type: 'rule',
    field,
    operator: 'equals',
    value: '',
  }
}

// ── Create a blank group ─────────────────────────────────────────
export function createGroup(): Group {
  return {
    id: nanoid(),
    type: 'group',
    logic: 'AND',
    children: [],
    collapsed: false,
  }
}

// ── Create the root group (app initial state) ────────────────────
export function createRootGroup(): Group {
  return {
    id: 'root',
    type: 'group',
    logic: 'AND',
    children: [createRule('name')],
    collapsed: false,
  }
}