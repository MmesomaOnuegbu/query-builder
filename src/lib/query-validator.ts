// lib/query-validator.ts

import { getOperatorsForType } from "../constants/operators"
import { Group, QueryNode, Rule } from "../types/query"
import { Schema } from "../types/schema"


export type ValidationError = {
  nodeId: string
  message: string
}

export type ValidationResult = {
  valid: boolean
  errors: ValidationError[]
}

// ── Main entry point ─────────────────────────────────────────────
export function validateQuery(root: Group, schema: Schema): ValidationResult {
  const errors: ValidationError[] = []
  validateGroup(root, schema, errors)
  return {
    valid: errors.length === 0,
    errors,
  }
}

// ── Group validator ──────────────────────────────────────────────
function validateGroup(group: Group, schema: Schema, errors: ValidationError[]) {
  // empty group is invalid
  if (group.children.length === 0) {
    errors.push({
      nodeId: group.id,
      message: 'Group must have at least one condition',
    })
    return
  }

  // recurse into children
  group.children.forEach(child => validateNode(child, schema, errors))
}

// ── Node router ──────────────────────────────────────────────────
function validateNode(node: QueryNode, schema: Schema, errors: ValidationError[]) {
  if (node.type === 'group') {
    validateGroup(node, schema, errors)
  } else {
    validateRule(node, schema, errors)
  }
}

// ── Rule validator ───────────────────────────────────────────────
function validateRule(rule: Rule, schema: Schema, errors: ValidationError[]) {
  // missing field
  if (!rule.field) {
    errors.push({ nodeId: rule.id, message: 'Please select a field' })
    return
  }

  // field not in schema
  const fieldDef = schema[rule.field]
  if (!fieldDef) {
    errors.push({ nodeId: rule.id, message: `Unknown field: ${rule.field}` })
    return
  }

  // missing operator
  if (!rule.operator) {
    errors.push({ nodeId: rule.id, message: 'Please select an operator' })
    return
  }

  // operator not valid for this field type
  const validOperators = getOperatorsForType(fieldDef.type)
  const operatorDef = validOperators.find(op => op.value === rule.operator)
  if (!operatorDef) {
    errors.push({
      nodeId: rule.id,
      message: `Operator "${rule.operator}" is not valid for field type "${fieldDef.type}"`,
    })
    return
  }

  // skip value check for null operators
  if (operatorDef.valueInput === 'none') return

  // missing value
  if (rule.value === '' || rule.value === null || rule.value === undefined) {
    errors.push({ nodeId: rule.id, message: 'Please enter a value' })
    return
  }

  // between needs array of 2
  if (rule.operator === 'between') {
    if (!Array.isArray(rule.value) || rule.value.length !== 2) {
      errors.push({ nodeId: rule.id, message: 'Between requires two values' })
      return
    }
    if (!rule.value[0] || !rule.value[1]) {
      errors.push({ nodeId: rule.id, message: 'Both between values are required' })
      return
    }
    // for dates, start must be before end
    if (fieldDef.type === 'date') {
      const start = new Date(rule.value[0] as string)
      const end   = new Date(rule.value[1] as string)
      if (start >= end) {
        errors.push({ nodeId: rule.id, message: 'Start date must be before end date' })
      }
    }
    // for numbers, min must be less than max
    if (fieldDef.type === 'number') {
      if (Number(rule.value[0]) >= Number(rule.value[1])) {
        errors.push({ nodeId: rule.id, message: 'Min value must be less than max value' })
      }
    }
    return
  }

  // in/notIn needs at least one value
  if (rule.operator === 'in' || rule.operator === 'notIn') {
    if (!Array.isArray(rule.value) || rule.value.length === 0) {
      errors.push({ nodeId: rule.id, message: 'Please select at least one value' })
    }
    return
  }

  // number fields must have numeric values
  if (fieldDef.type === 'number' && isNaN(Number(rule.value))) {
    errors.push({ nodeId: rule.id, message: 'Value must be a number' })
    return
  }

  // date fields must have valid dates
  if (fieldDef.type === 'date' && isNaN(new Date(rule.value as string).getTime())) {
    errors.push({ nodeId: rule.id, message: 'Value must be a valid date' })
    return
  }
}

// ── Helper — get error for a specific node ───────────────────────
// call this in RuleNode to show inline errors
export function getNodeError(
  errors: ValidationError[],
  nodeId: string
): string | undefined {
  return errors.find(e => e.nodeId === nodeId)?.message
}