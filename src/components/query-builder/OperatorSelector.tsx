// components/query-builder/OperatorSelector.tsx
import { memo } from 'react'
import { Schema } from '@/types/schema'
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
    <div className="flex flex-col gap-1">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={!field}
        className={`
          h-9 px-3 py-2 text-sm rounded-lg border-2 bg-emerald-50 dark:bg-emerald-950/20 text-foreground
          focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          min-w-[100px] max-w-full font-medium
          ${error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-emerald-300 dark:border-emerald-700'}
        `}
      >
        <option value="">Select operator...</option>
        {operators.map(op => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

export default memo(OperatorSelector)