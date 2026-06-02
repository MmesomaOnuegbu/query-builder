// components/query-builder/LogicSelector.tsx
import { memo } from 'react'

type Props = {
  value:    'AND' | 'OR'
  onChange: (value: 'AND' | 'OR') => void
}

function LogicSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
      {(['AND', 'OR'] as const).map(logic => (
        <button
          key={logic}
          type="button"
          onClick={() => onChange(logic)}
          className={`
            px-3 py-1 text-xs font-semibold rounded transition-colors
            ${value === logic
              ? logic === 'AND'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-orange-500 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {logic}
        </button>
      ))}
    </div>
  )
}

export default memo(LogicSelector)