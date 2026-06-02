// lib/query-generator.ts
import { Group, Rule, QueryNode, RuleValue } from '@/types/query'

// ── Main entry point ─────────────────────────────────────────────
export function generateSQL(root: Group): string {
  if (root.children.length === 0) return 'SELECT * FROM users'
  const where = generateGroupSQL(root, 0)
  return `SELECT * FROM users\nWHERE ${where}`
}

export function generateMongo(root: Group): object {
  if (root.children.length === 0) return {}
  return generateGroupMongo(root)
}

// ── SQL generation ───────────────────────────────────────────────
function generateGroupSQL(group: Group, depth: number): string {
  if (group.children.length === 0) return ''

  const indent = '  '.repeat(depth)
  const parts = group.children
    .map(child => generateNodeSQL(child, depth + 1))
    .filter(Boolean)

  if (parts.length === 1) return parts[0]

  const joined = parts.join(`\n${indent}${group.logic} `)
  return depth > 0 ? `(\n${indent}  ${joined}\n${indent})` : joined
}

function generateNodeSQL(node: QueryNode, depth: number): string {
  if (node.type === 'group') {
    const result = generateGroupSQL(node, depth)
    return node.negated ? `NOT ${result}` : result
  }
  return generateRuleSQL(node)
}

function generateRuleSQL(rule: Rule): string {
  if (!rule.field || !rule.operator) return ''

  const field = rule.field
  const val = rule.value
  const negated = rule.negated ? 'NOT ' : ''

  switch (rule.operator) {
    case 'equals':
      return `${negated}${field} = ${formatSQLValue(val)}`
    case 'notEquals':
      return `${field} != ${formatSQLValue(val)}`
    case 'contains':
      return `${negated}${field} LIKE '%${val}%'`
    case 'notContains':
      return `${field} NOT LIKE '%${val}%'`
    case 'startsWith':
      return `${negated}${field} LIKE '${val}%'`
    case 'endsWith':
      return `${negated}${field} LIKE '%${val}'`
    case 'greaterThan':
      return `${field} > ${val}`
    case 'lessThan':
      return `${field} < ${val}`
    case 'gte':
      return `${field} >= ${val}`
    case 'lte':
      return `${field} <= ${val}`
    case 'between': {
      if (!Array.isArray(val)) return ''
      return `${negated}${field} BETWEEN ${formatSQLValue(val[0])} AND ${formatSQLValue(val[1])}`
    }
    case 'in': {
      if (!Array.isArray(val)) return ''
      const list = val.map(formatSQLValue).join(', ')
      return `${negated}${field} IN (${list})`
    }
    case 'notIn': {
      if (!Array.isArray(val)) return ''
      const list = val.map(formatSQLValue).join(', ')
      return `${field} NOT IN (${list})`
    }
    case 'isNull':
      return `${field} IS NULL`
    case 'isNotNull':
      return `${field} IS NOT NULL`
    default:
      return ''
  }
}

function formatSQLValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'number') return String(val)
  return `'${String(val).replace(/'/g, "''")}'`
}

// ── Mongo generation ─────────────────────────────────────────────
function generateGroupMongo(group: Group): object {
  if (group.children.length === 0) return {}

  const parts = group.children
    .map(child => generateNodeMongo(child))
    .filter(p => Object.keys(p).length > 0)

  if (parts.length === 0) return {}
  if (parts.length === 1) return parts[0]

  const key = group.logic === 'AND' ? '$and' : '$or'
  return { [key]: parts }
}

function generateNodeMongo(node: QueryNode): object {
  if (node.type === 'group') {
    const result = generateGroupMongo(node)
    return node.negated ? { $nor: [result] } : result
  }
  return generateRuleMongo(node)
}

function generateRuleMongo(rule: Rule): object {
  if (!rule.field || !rule.operator) return {}

  const f = rule.field
  const v = rule.value

  switch (rule.operator) {
    case 'equals':      return { [f]: v }
    case 'notEquals':   return { [f]: { $ne: v } }
    case 'contains':    return { [f]: { $regex: v, $options: 'i' } }
    case 'notContains': return { [f]: { $not: { $regex: v, $options: 'i' } } }
    case 'startsWith':  return { [f]: { $regex: `^${v}`, $options: 'i' } }
    case 'endsWith':    return { [f]: { $regex: `${v}$`, $options: 'i' } }
    case 'greaterThan': return { [f]: { $gt: v } }
    case 'lessThan':    return { [f]: { $lt: v } }
    case 'gte':         return { [f]: { $gte: v } }
    case 'lte':         return { [f]: { $lte: v } }
    case 'between': {
      if (!Array.isArray(v)) return {}
      return { [f]: { $gte: v[0], $lte: v[1] } }
    }
    case 'in':          return { [f]: { $in: v } }
    case 'notIn':       return { [f]: { $nin: v } }
    case 'isNull':      return { [f]: null }
    case 'isNotNull':   return { [f]: { $ne: null } }
    default:            return {}
  }
}