// components/query-builder/OperatorSelector.tsx
import { memo } from 'react'
import { Schema } from '../types/schema'
import { getOperatorsForField } from '@/lib/schema-utils'

type Props = {
  field:    string
  value:    string
  schema:   Schema
  onChange: (operator: string) => void
  error?:   string
}

function OperatorSelector({ field, value, schema, onChange, error }: Props) {
  const operators = getOperatorsForField(schema, field)

  return (
    <div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={!field}
        className={`
          h-8 px-2 text-sm rounded border bg-background text-foreground
          focus:outline-none focus:ring-1 focus:ring-blue-500
          min-w-[130px] disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-border'}
        `}
      >
        <option value="">Select operator...</option>
        {operators.map(op => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default memo(OperatorSelector)