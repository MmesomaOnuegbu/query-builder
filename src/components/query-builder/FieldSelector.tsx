// components/query-builder/FieldSelector.tsx
import { memo } from 'react'
import { Schema } from '../types/schema'
import { getSchemaFields } from '@/lib/schema-utils'

type Props = {
  value:    string
  schema:   Schema
  onChange: (field: string) => void
  error?:   string
}

function FieldSelector({ value, schema, onChange, error }: Props) {
  const fields = getSchemaFields(schema)

  return (
    <div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`
          h-8 px-2 text-sm rounded border bg-background text-foreground
          focus:outline-none focus:ring-1 focus:ring-blue-500
          min-w-[130px]
          ${error ? 'border-red-500' : 'border-border'}
        `}
      >
        <option value="">Select field...</option>
        {fields.map(f => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default memo(FieldSelector)