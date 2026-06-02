

// ─── Main entry point ────────────────────────────────────────────

import { MockUser } from "../components/mock/data"
import { Group, QueryNode, Rule, RuleValue } from "../components/types/query"

// This is the only function you call from outside this file
export function executeQuery(root: Group, data: MockUser[]): MockUser[] {
  return data.filter(record => evaluateGroup(root, record))
}

// ─── Group evaluator ─────────────────────────────────────────────
// walks every child — if logic is AND, all must pass
// if logic is OR, at least one must pass
function evaluateGroup(group: Group, record: MockUser): boolean {
  if (group.children.length === 0) return true

  if (group.logic === 'AND') {
    return group.children.every(child => evaluateNode(child, record))
  }

  return group.children.some(child => evaluateNode(child, record))
}

// ─── Node router ─────────────────────────────────────────────────
// decides whether to evaluate a Rule or recurse into a Group
function evaluateNode(node: QueryNode, record: MockUser): boolean {
  if (node.type === 'group') {
    const result = evaluateGroup(node, record)
    return node.negated ? !result : result  // handles NOT group
  }
  return evaluateRule(node, record)
}

// ─── Rule evaluator ──────────────────────────────────────────────
function evaluateRule(rule: Rule, record: MockUser): boolean {
  const recordValue = record[rule.field as keyof MockUser]
  const result = applyOperator(rule.operator, recordValue, rule.value)
  return rule.negated ? !result : result   // handles NOT rule
}

// ─── Operator logic ──────────────────────────────────────────────
function applyOperator(
  operator: string,
  recordValue: unknown,
  ruleValue: RuleValue
): boolean {
  // safety — treat undefined as null
  if (recordValue === undefined) recordValue = null

  switch (operator) {

    case 'equals':
      return String(recordValue).toLowerCase() === String(ruleValue).toLowerCase()

    case 'notEquals':
      return String(recordValue).toLowerCase() !== String(ruleValue).toLowerCase()

    case 'contains':
      return String(recordValue)
        .toLowerCase()
        .includes(String(ruleValue).toLowerCase())

    case 'notContains':
      return !String(recordValue)
        .toLowerCase()
        .includes(String(ruleValue).toLowerCase())

    case 'startsWith':
      return String(recordValue)
        .toLowerCase()
        .startsWith(String(ruleValue).toLowerCase())

    case 'endsWith':
      return String(recordValue)
        .toLowerCase()
        .endsWith(String(ruleValue).toLowerCase())

    case 'greaterThan':
      return compareValues(recordValue, ruleValue) > 0

    case 'lessThan':
      return compareValues(recordValue, ruleValue) < 0

    case 'gte':
      return compareValues(recordValue, ruleValue) >= 0

    case 'lte':
      return compareValues(recordValue, ruleValue) <= 0

    case 'between': {
      // ruleValue is [min, max]
      if (!Array.isArray(ruleValue) || ruleValue.length !== 2) return false
      const [min, max] = ruleValue
      return (
        compareValues(recordValue, min) >= 0 &&
        compareValues(recordValue, max) <= 0
      )
    }

    case 'in':
      if (!Array.isArray(ruleValue)) return false
      return ruleValue
        .map(v => String(v).toLowerCase())
        .includes(String(recordValue).toLowerCase())

    case 'notIn':
      if (!Array.isArray(ruleValue)) return false
      return !ruleValue
        .map(v => String(v).toLowerCase())
        .includes(String(recordValue).toLowerCase())

    case 'isNull':
      return recordValue === null || recordValue === '' || recordValue === undefined

    case 'isNotNull':
      return recordValue !== null && recordValue !== '' && recordValue !== undefined

    default:
      return false
  }
}

// ─── Compare helper ──────────────────────────────────────────────
// handles both numbers and date strings cleanly
function compareValues(a: unknown, b: unknown): number {
  // date strings — compare as dates
  if (isDateString(a) && isDateString(b)) {
    return new Date(a as string).getTime() - new Date(b as string).getTime()
  }

  // numbers
  const numA = Number(a)
  const numB = Number(b)
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB
  }

  // fallback — string comparison
  return String(a).localeCompare(String(b))
}

function isDateString(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const d = new Date(value)
  return !isNaN(d.getTime()) && value.includes('-')
}