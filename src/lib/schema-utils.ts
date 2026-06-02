// lib/schema-utils.ts
import { getOperatorsForType, Operator } from '../constants/operators';
import { RuleValue } from '../types/query';
import { FieldDefinition, FieldType, Schema } from '../types/schema';


// ── Get a single field definition ────────────────────────────────
export function getFieldDef(
  schema: Schema,
  field: string
): FieldDefinition | undefined {
  return schema[field]
}

// ── Get field type ────────────────────────────────────────────────
export function getFieldType(
  schema: Schema,
  field: string
): FieldType {
  return schema[field]?.type ?? 'string'
}

// ── Get all fields as array for dropdowns ─────────────────────────
export function getSchemaFields(
  schema: Schema
): { value: string; label: string; type: FieldType }[] {
  return Object.entries(schema).map(([key, def]) => ({
    value: key,
    label: def.name,
    type:  def.type,
  }))
}

// ── Get valid operators for a field ───────────────────────────────
export function getOperatorsForField(
  schema: Schema,
  field: string
): Operator[] {
  const type = getFieldType(schema, field)
  return getOperatorsForType(type)
}

// ── Get enum options for a field ──────────────────────────────────
export function getEnumOptions(
  schema: Schema,
  field: string
): string[] {
  return schema[field]?.options ?? []
}

// ── Get default operator for a field ─────────────────────────────
// used when user switches field — reset operator to first valid one
export function getDefaultOperator(
  schema: Schema,
  field: string
): string {
  const operators = getOperatorsForField(schema, field)
  return operators[0]?.value ?? 'equals'
}

// ── Get default value for a field ────────────────────────────────
// used when user switches field or operator — reset value
export function getDefaultValue(
  schema: Schema,
  field: string,
  operator: string
): RuleValue {
  const type = getFieldType(schema, field)
  const ops  = getOperatorsForField(schema, field)
  const op   = ops.find(o => o.value === operator)

  if (!op || op.valueInput === 'none') return null
  if (op.valueInput === 'multi-select')  return []
  if (op.valueInput === 'number-range')  return ['', '']
  if (op.valueInput === 'date-range')    return ['', '']
  if (type === 'number')                 return ''
  if (type === 'date')                   return ''
  if (type === 'boolean')                return 'true'

  return ''
}
// ── Check if operator needs a value input ────────────────────────
export function operatorNeedsValue(
  schema: Schema,
  field: string,
  operator: string
): boolean {
  const ops = getOperatorsForField(schema, field)
  const op  = ops.find(o => o.value === operator)
  return op?.valueInput !== 'none'
}