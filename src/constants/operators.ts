// constants/operators.ts

export type Operator = {
  value: string          // stored in Rule.operator
  label: string          // shown in the dropdown
  valueInput: 
    | 'text'             // plain text input
    | 'number'           // number input
    | 'date'             // date picker
    | 'date-range'       // two date pickers (between)
    | 'number-range'     // two number inputs (between)
    | 'multi-select'     // for "in array"
    | 'none'             // no input needed (is null, is not null)
}

// maps each field type to its allowed operators
export const OPERATORS_BY_TYPE: Record<string, Operator[]> = {

  string: [
    { value: 'equals',      label: 'equals',        valueInput: 'text' },
    { value: 'notEquals',   label: 'not equals',    valueInput: 'text' },
    { value: 'contains',    label: 'contains',      valueInput: 'text' },
    { value: 'notContains', label: 'not contains',  valueInput: 'text' },
    { value: 'startsWith',  label: 'starts with',   valueInput: 'text' },
    { value: 'endsWith',    label: 'ends with',     valueInput: 'text' },
    { value: 'isNull',      label: 'is empty',      valueInput: 'none' },
    { value: 'isNotNull',   label: 'is not empty',  valueInput: 'none' },
  ],

  number: [
    { value: 'equals',      label: 'equals',        valueInput: 'number' },
    { value: 'notEquals',   label: 'not equals',    valueInput: 'number' },
    { value: 'greaterThan', label: 'greater than',  valueInput: 'number' },
    { value: 'lessThan',    label: 'less than',     valueInput: 'number' },
    { value: 'gte',         label: '≥ at least',    valueInput: 'number' },
    { value: 'lte',         label: '≤ at most',     valueInput: 'number' },
    { value: 'between',     label: 'between',       valueInput: 'number-range' },
    { value: 'isNull',      label: 'is empty',      valueInput: 'none' },
    { value: 'isNotNull',   label: 'is not empty',  valueInput: 'none' },
  ],

  enum: [
    { value: 'equals',      label: 'is',            valueInput: 'text' },
    { value: 'notEquals',   label: 'is not',        valueInput: 'text' },
    { value: 'in',          label: 'is any of',     valueInput: 'multi-select' },
    { value: 'notIn',       label: 'is none of',    valueInput: 'multi-select' },
    { value: 'isNull',      label: 'is empty',      valueInput: 'none' },
    { value: 'isNotNull',   label: 'is not empty',  valueInput: 'none' },
  ],

  date: [
    { value: 'equals',      label: 'is on',         valueInput: 'date' },
    { value: 'notEquals',   label: 'is not on',     valueInput: 'date' },
    { value: 'greaterThan', label: 'is after',      valueInput: 'date' },
    { value: 'lessThan',    label: 'is before',     valueInput: 'date' },
    { value: 'between',     label: 'is between',    valueInput: 'date-range' },
    { value: 'isNull',      label: 'is empty',      valueInput: 'none' },
    { value: 'isNotNull',   label: 'is not empty',  valueInput: 'none' },
  ],

  boolean: [
    { value: 'equals',      label: 'is',            valueInput: 'text' },
  ],

}

// helper — call this in OperatorSelector
export function getOperatorsForType(fieldType: string): Operator[] {
  return OPERATORS_BY_TYPE[fieldType] ?? OPERATORS_BY_TYPE.string
}

// helper — call this in query-generator and query-executor
export function getOperator(fieldType: string, operatorValue: string): Operator | undefined {
  return getOperatorsForType(fieldType).find(op => op.value === operatorValue)
}