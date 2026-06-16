// src/tests/query-executor.test.ts
import { describe, it, expect } from 'vitest'
import { executeQuery } from '@/lib/query-executor'
import { MockUser } from '@/mock/data'
import { Group } from '@/types/query'

// ── Small predictable dataset for tests ──────────────────────────
const testData: MockUser[] = [
  {
    id: 1, name: 'Amara Osei', email: 'amara@test.com',
    age: 24, country: 'Ghana', status: 'active',
    purchases: 12, spending: 500,
    createdAt: '2022-01-01', lastLogin: '2024-01-01',
    isVerified: true,
  },
  {
    id: 2, name: 'Fatima Bello', email: 'fatima@test.com',
    age: 31, country: 'Nigeria', status: 'inactive',
    purchases: 3, spending: 100,
    createdAt: '2021-05-10', lastLogin: '2023-06-01',
    isVerified: false,
  },
  {
    id: 3, name: 'Kwame Mensah', email: 'kwame@test.com',
    age: 18, country: 'Ghana', status: 'active',
    purchases: 50, spending: 2000,
    createdAt: '2023-03-15', lastLogin: '2024-02-01',
    isVerified: true,
  },
  {
    id: 4, name: 'Ngozi Nwosu', email: 'ngozi@test.com',
    age: 45, country: 'Nigeria', status: 'pending',
    purchases: 0, spending: 0,
    createdAt: '2020-07-20', lastLogin: '2023-01-01',
    isVerified: false,
  },
  {
    id: 5, name: 'Yusuf Diallo', email: 'yusuf@test.com',
    age: 29, country: 'Kenya', status: 'banned',
    purchases: 100, spending: 5000,
    createdAt: '2022-11-11', lastLogin: '2024-03-01',
    isVerified: true,
  },
]

// ── Helper to build a simple group ───────────────────────────────
function makeGroup(logic: 'AND' | 'OR', children: Group['children']): Group {
  return { id: 'g1', type: 'group', logic, children }
}

// ═════════════════════════════════════════════════════════════════
describe('executeQuery — empty and base cases', () => {

  it('returns all records for empty group', () => {
    const query = makeGroup('AND', [])
    expect(executeQuery(query, testData)).toHaveLength(testData.length)
  })

  it('returns empty array when no records match', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 999 }
    ])
    expect(executeQuery(query, testData)).toHaveLength(0)
  })

  it('returns all records when all match', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 0 }
    ])
    expect(executeQuery(query, testData)).toHaveLength(testData.length)
  })

})

// ═════════════════════════════════════════════════════════════════
describe('executeQuery — single rule operators', () => {

  it('equals', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'country', operator: 'equals', value: 'Ghana' }
    ])
    const results = executeQuery(query, testData)
    expect(results).toHaveLength(2)
    expect(results.every(r => r.country === 'Ghana')).toBe(true)
  })

  it('notEquals', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'country', operator: 'notEquals', value: 'Ghana' }
    ])
    const results = executeQuery(query, testData)
    expect(results.every(r => r.country !== 'Ghana')).toBe(true)
  })

  it('contains', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'name', operator: 'contains', value: 'Bello' }
    ])
    const results = executeQuery(query, testData)
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Fatima Bello')
  })

  it('startsWith', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'name', operator: 'startsWith', value: 'Amara' }
    ])
    const results = executeQuery(query, testData)
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Amara Osei')
  })

  it('greaterThan', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 30 }
    ])
    const results = executeQuery(query, testData)
    expect(results.every(r => r.age > 30)).toBe(true)
  })

  it('lessThan', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'lessThan', value: 25 }
    ])
    const results = executeQuery(query, testData)
    expect(results.every(r => r.age < 25)).toBe(true)
  })

  it('between', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'between', value: ['20', '35'] }
    ])
    const results = executeQuery(query, testData)
    expect(results.every(r => r.age >= 20 && r.age <= 35)).toBe(true)
  })

  it('in array', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'status', operator: 'in', value: ['active', 'pending'] }
    ])
    const results = executeQuery(query, testData)
    expect(results.every(r => ['active', 'pending'].includes(r.status))).toBe(true)
  })

  it('isNull', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'purchases', operator: 'isNull', value: null }
    ])
    const results = executeQuery(query, testData)
    expect(results.every(r => r.purchases === null || r.purchases === 0)).toBe(true)
  })

  it('isNotNull', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'name', operator: 'isNotNull', value: null }
    ])
    const results = executeQuery(query, testData)
    expect(results).toHaveLength(testData.length)
  })

})

// ═════════════════════════════════════════════════════════════════
describe('executeQuery — AND / OR logic', () => {

  it('AND — both conditions must match', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'country', operator: 'equals', value: 'Ghana' },
      { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
    ])
    const results = executeQuery(query, testData)
    expect(results.every(r => r.country === 'Ghana' && r.status === 'active')).toBe(true)
  })

  it('OR — at least one condition must match', () => {
    const query = makeGroup('OR', [
      { id: 'r1', type: 'rule', field: 'country', operator: 'equals', value: 'Kenya' },
      { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'inactive' },
    ])
    const results = executeQuery(query, testData)
    expect(results.every(r => r.country === 'Kenya' || r.status === 'inactive')).toBe(true)
  })

})

// ═════════════════════════════════════════════════════════════════
describe('executeQuery — nested groups', () => {

  it('handles one level of nesting', () => {
    const query: Group = {
      id: 'g1',
      type: 'group',
      logic: 'AND',
      children: [
        { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 18 },
        {
          id: 'g2',
          type: 'group',
          logic: 'OR',
          children: [
            { id: 'r2', type: 'rule', field: 'country', operator: 'equals', value: 'Ghana' },
            { id: 'r3', type: 'rule', field: 'country', operator: 'equals', value: 'Kenya' },
          ]
        }
      ]
    }
    const results = executeQuery(query, testData)
    expect(results.every(r =>
      r.age > 18 && (r.country === 'Ghana' || r.country === 'Kenya')
    )).toBe(true)
  })

  it('handles deeply nested groups', () => {
    const query: Group = {
      id: 'g1',
      type: 'group',
      logic: 'AND',
      children: [
        {
          id: 'g2',
          type: 'group',
          logic: 'AND',
          children: [
            {
              id: 'g3',
              type: 'group',
              logic: 'OR',
              children: [
                { id: 'r1', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
                { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'pending' },
              ]
            }
          ]
        }
      ]
    }
    const results = executeQuery(query, testData)
    expect(results.every(r => r.status === 'active' || r.status === 'pending')).toBe(true)
  })

})

// ═════════════════════════════════════════════════════════════════
describe('executeQuery — negation', () => {

  it('negated rule returns opposite results', () => {
    const query = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'country', operator: 'equals', value: 'Ghana', negated: true }
    ])
    const results = executeQuery(query, testData)
    expect(results.every(r => r.country !== 'Ghana')).toBe(true)
  })

})