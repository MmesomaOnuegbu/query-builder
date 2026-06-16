import { describe, it, expect } from 'vitest'
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
import { Group } from '@/types/query'

const baseTree: Group = {
  id: 'root',
  type: 'group',
  logic: 'AND',
  children: [
    { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 18 },
    { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
  ]
}

describe('createRule', () => {
  it('creates rule with correct shape', () => {
    const rule = createRule('age')
    expect(rule.type).toBe('rule')
    expect(rule.field).toBe('age')
    expect(rule.operator).toBe('equals')
    expect(rule.id).toBeTruthy()
  })
})

describe('createGroup', () => {
  it('creates group with correct shape', () => {
    const group = createGroup()
    expect(group.type).toBe('group')
    expect(group.logic).toBe('AND')
    expect(group.children).toHaveLength(0)
    expect(group.id).toBeTruthy()
  })
})

describe('createRootGroup', () => {
  it('creates root with one default rule', () => {
    const root = createRootGroup()
    expect(root.id).toBe('root')
    expect(root.children).toHaveLength(1)
  })
})

describe('addNode', () => {
  it('adds rule to root', () => {
    const rule = createRule('name')
    const result = addNode(baseTree, 'root', rule)
    expect(result.children).toHaveLength(3)
  })

  it('adds group to nested group', () => {
    const tree: Group = {
      id: 'root', type: 'group', logic: 'AND',
      children: [
        { id: 'g2', type: 'group', logic: 'OR', children: [] }
      ]
    }
    const rule = createRule('age')
    const result = addNode(tree, 'g2', rule)
    const nested = result.children[0] as Group
    expect(nested.children).toHaveLength(1)
  })

  it('does not mutate original tree', () => {
    const rule = createRule('name')
    addNode(baseTree, 'root', rule)
    expect(baseTree.children).toHaveLength(2)
  })
})

describe('removeNode', () => {
  it('removes rule by id', () => {
    const result = removeNode(baseTree, 'r1')
    expect(result.children).toHaveLength(1)
    expect(result.children[0].id).toBe('r2')
  })

  it('removes nested node', () => {
    const tree: Group = {
      id: 'root', type: 'group', logic: 'AND',
      children: [
        {
          id: 'g2', type: 'group', logic: 'OR',
          children: [
            { id: 'r3', type: 'rule', field: 'age', operator: 'equals', value: 1 }
          ]
        }
      ]
    }
    const result = removeNode(tree, 'r3')
    const nested = result.children[0] as Group
    expect(nested.children).toHaveLength(0)
  })

  it('does not mutate original tree', () => {
    removeNode(baseTree, 'r1')
    expect(baseTree.children).toHaveLength(2)
  })
})

describe('updateRule', () => {
  it('updates rule field', () => {
    const result = updateRule(baseTree, 'r1', { field: 'name' })
    const rule = result.children[0]
    expect(rule.type === 'rule' && rule.field).toBe('name')
  })

  it('updates nested rule', () => {
    const tree: Group = {
      id: 'root', type: 'group', logic: 'AND',
      children: [
        {
          id: 'g2', type: 'group', logic: 'OR',
          children: [
            { id: 'r3', type: 'rule', field: 'age', operator: 'equals', value: 1 }
          ]
        }
      ]
    }
    const result = updateRule(tree, 'r3', { value: 99 })
    const nested = result.children[0] as Group
    const rule = nested.children[0]
    expect(rule.type === 'rule' && rule.value).toBe(99)
  })
})

describe('updateGroup', () => {
  it('updates group logic', () => {
    const result = updateGroup(baseTree, 'root', { logic: 'OR' })
    expect(result.logic).toBe('OR')
  })
})

describe('reorderChildren', () => {
  it('reorders children correctly', () => {
    const result = reorderChildren(baseTree, 'root', 0, 1)
    expect(result.children[0].id).toBe('r2')
    expect(result.children[1].id).toBe('r1')
  })
})