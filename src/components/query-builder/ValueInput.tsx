// components/query-builder/ValueInput.tsx
import React, { memo } from 'react'
import { Schema } from '@/types/schema'
import { getFieldType, getEnumOptions, getOperatorsForField } from '@/lib/schema-utils'
import { RuleValue } from '@/types/query'


type Props = {
  field:     string
  operator:  string
  value:     RuleValue
  schema:    Schema
  onChange:  (value: RuleValue) => void
  error?:    string
}

function ValueInput({ field, operator, value, schema, onChange, error }: Props) {
  const fieldType = getFieldType(schema, field)
  const operators = getOperatorsForField(schema, field)
  const operatorDef = operators.find(op => op.value === operator)
  const inputType = operatorDef?.valueInput

  // ── No input needed ──────────────────────────────────────────
  if (!inputType || inputType === 'none') {
    return null
  }

  // ── Multi select (for enum in/notIn) ─────────────────────────
  if (inputType === 'multi-select') {
    const options = getEnumOptions(schema, field)
    const selected = Array.isArray(value) ? value as string[] : []

    return (
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-2">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                const next = selected.includes(opt)
                  ? selected.filter(v => v !== opt)
                  : [...selected, opt]
                onChange(next)
              }}
              className={`
                px-3 py-1.5 rounded-lg text-sm border-2 font-medium transition-all duration-200
                ${selected.includes(opt)
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 text-foreground hover:border-emerald-500'
                }
              `}
            >
              {opt}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    )
  }

  // ── Number range (between for numbers) ───────────────────────
  if (inputType === 'number-range') {
    const range = Array.isArray(value) ? value as string[] : ['', '']

    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={range[0]}
          placeholder="min"
          onChange={e => onChange([e.target.value, range[1]])}
          className={baseInput(error)}
        />
        <span className="text-muted-foreground text-xs">to</span>
        <input
          type="number"
          value={range[1]}
          placeholder="max"
          onChange={e => onChange([range[0], e.target.value])}
          className={baseInput(error)}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  // ── Date range (between for dates) ───────────────────────────
  if (inputType === 'date-range') {
    const range = Array.isArray(value) ? value as string[] : ['', '']

    return (
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={range[0]}
          onChange={e => onChange([e.target.value, range[1]])}
          className={baseInput(error)}
        />
        <span className="text-muted-foreground text-xs">to</span>
        <input
          type="date"
          value={range[1]}
          onChange={e => onChange([range[0], e.target.value])}
          className={baseInput(error)}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  // ── Date single ───────────────────────────────────────────────
  if (inputType === 'date') {
    return (
      <div>
        <input
          type="date"
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value)}
          className={baseInput(error)}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // ── Number single ─────────────────────────────────────────────
  if (inputType === 'number') {
    return (
      <div>
        <input
          type="number"
          value={value as string ?? ''}
          placeholder="Enter number"
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={baseInput(error)}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // ── Enum single (equals/notEquals) ───────────────────────────
  if (fieldType === 'enum') {
    const options = getEnumOptions(schema, field)
    return (
      <div>
        <select
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value)}
          className={baseInput(error)}
        >
          <option value="">Select...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // ── Boolean ───────────────────────────────────────────────────
  if (fieldType === 'boolean') {
    return (
      <div>
        <select
          value={value as string ?? 'true'}
          onChange={e => onChange(e.target.value)}
          className={baseInput(error)}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // ── Default text ──────────────────────────────────────────────
  return (
    <div>
      <input
        type="text"
        value={value as string ?? ''}
        placeholder="Enter value"
        onChange={e => onChange(e.target.value)}
        className={baseInput(error)}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ── Base input styles ─────────────────────────────────────────────
function baseInput(error?: string) {
  return `
    h-9 px-3 py-2 text-sm rounded-lg border-2 bg-emerald-50 dark:bg-emerald-950/20 text-foreground
    focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
    transition-all duration-200
    min-w-[80px] max-w-full font-medium
    ${error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-emerald-300 dark:border-emerald-700'}
  `
}

export default memo(ValueInput)