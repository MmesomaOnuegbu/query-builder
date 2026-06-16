import { describe, it, expect } from 'vitest'
import { validateQuery, getNodeError } from '@/lib/query-validator'
import { mockSchema } from '@/mock/schema'
import { Group } from '@/types/query'

function makeGroup(children: Group['children']): Group {
  return { id: 'g1', type: 'group', logic: 'AND', children }
}

describe('validateQuery', () => {

  it('valid query returns no errors', () => {
    const q = makeGroup([
      { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 18 }
    ])
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('empty group is invalid', () => {
    const q = makeGroup([])
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
  })

  it('missing field is invalid', () => {
    const q = makeGroup([
      { id: 'r1', type: 'rule', field: '', operator: 'equals', value: 'test' }
    ])
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(false)
  })

  it('missing operator is invalid', () => {
    const q = makeGroup([
      { id: 'r1', type: 'rule', field: 'age', operator: '', value: 18 }
    ])
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(false)
  })

  it('missing value is invalid', () => {
    const q = makeGroup([
      { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: '' }
    ])
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(false)
  })

  it('isNull operator does not need value', () => {
    const q = makeGroup([
      { id: 'r1', type: 'rule', field: 'name', operator: 'isNull', value: null }
    ])
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(true)
  })

  it('between needs two values', () => {
    const q = makeGroup([
      { id: 'r1', type: 'rule', field: 'age', operator: 'between', value: ['18'] }
    ])
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(false)
  })

  it('invalid date range is invalid', () => {
    const q = makeGroup([
      { id: 'r1', type: 'rule', field: 'createdAt', operator: 'between', value: ['2024-01-01', '2020-01-01'] }
    ])
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(false)
  })

  it('in operator needs at least one value', () => {
    const q = makeGroup([
      { id: 'r1', type: 'rule', field: 'status', operator: 'in', value: [] }
    ])
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(false)
  })

  it('nested empty group is invalid', () => {
    const q: Group = {
      id: 'g1', type: 'group', logic: 'AND',
      children: [
        { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 18 },
        { id: 'g2', type: 'group', logic: 'OR', children: [] }
      ]
    }
    const result = validateQuery(q, mockSchema)
    expect(result.valid).toBe(false)
  })

})

describe('getNodeError', () => {

  it('returns error message for node', () => {
    const errors = [{ nodeId: 'r1', message: 'Required' }]
    expect(getNodeError(errors, 'r1')).toBe('Required')
  })

  it('returns undefined for node with no error', () => {
    const errors = [{ nodeId: 'r1', message: 'Required' }]
    expect(getNodeError(errors, 'r2')).toBeUndefined()
  })

})