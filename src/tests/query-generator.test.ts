import { describe, it, expect } from 'vitest'
import { generateSQL, generateMongo } from '@/lib/query-generator'
import { Group } from '@/types/query'

function makeGroup(logic: 'AND' | 'OR', children: Group['children']): Group {
  return { id: 'g1', type: 'group', logic, children }
}

describe('generateSQL', () => {

  it('returns base query for empty group', () => {
    expect(generateSQL(makeGroup('AND', []))).toBe('SELECT * FROM users')
  })

  it('generates single rule', () => {
    const q = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 18 }
    ])
    expect(generateSQL(q)).toContain('age > 18')
  })

  it('generates AND conditions', () => {
    const q = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 18 },
      { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
    ])
    const sql = generateSQL(q)
    expect(sql).toContain('age > 18')
    expect(sql).toContain("status = 'active'")
    expect(sql).toContain('AND')
  })

  it('generates OR conditions', () => {
    const q = makeGroup('OR', [
      { id: 'r1', type: 'rule', field: 'country', operator: 'equals', value: 'Ghana' },
      { id: 'r2', type: 'rule', field: 'country', operator: 'equals', value: 'Nigeria' },
    ])
    const sql = generateSQL(q)
    expect(sql).toContain('OR')
  })

  it('generates LIKE for contains', () => {
    const q = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'name', operator: 'contains', value: 'Amara' }
    ])
    expect(generateSQL(q)).toContain("LIKE '%Amara%'")
  })

  it('generates BETWEEN', () => {
    const q = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'between', value: ['18', '30'] }
    ])
    expect(generateSQL(q)).toContain('BETWEEN')
  })

  it('generates IN', () => {
    const q = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'status', operator: 'in', value: ['active', 'pending'] }
    ])
    expect(generateSQL(q)).toContain('IN')
  })

  it('generates IS NULL', () => {
    const q = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'name', operator: 'isNull', value: null }
    ])
    expect(generateSQL(q)).toContain('IS NULL')
  })

})

describe('generateMongo', () => {

  it('returns empty object for empty group', () => {
    expect(generateMongo(makeGroup('AND', []))).toEqual({})
  })

  it('generates equals', () => {
    const q = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'status', operator: 'equals', value: 'active' }
    ])
    expect(generateMongo(q)).toEqual({ status: 'active' })
  })

  it('generates $gt', () => {
    const q = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 18 }
    ])
    expect(generateMongo(q)).toEqual({ age: { $gt: 18 } })
  })

  it('generates $and', () => {
    const q = makeGroup('AND', [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 18 },
      { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
    ])
    const result = generateMongo(q) as any
    expect(result).toHaveProperty('$and')
  })

  it('generates $or', () => {
    const q = makeGroup('OR', [
      { id: 'r1', type: 'rule', field: 'country', operator: 'equals', value: 'Ghana' },
      { id: 'r2', type: 'rule', field: 'country', operator: 'equals', value: 'Nigeria' },
    ])
    const result = generateMongo(q) as any
    expect(result).toHaveProperty('$or')
  })

})