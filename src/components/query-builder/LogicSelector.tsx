// components/query-builder/LogicSelector.tsx
import { memo } from 'react'

type Props = {
  value:    'AND' | 'OR'
  onChange: (value: 'AND' | 'OR') => void
}

function LogicSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-1 border-2 border-emerald-300 dark:border-emerald-700">
      {(['AND', 'OR'] as const).map(logic => (
        <button
          key={logic}
          type="button"
          onClick={() => onChange(logic)}
          className={`
            px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
            ${value === logic
              ? logic === 'AND'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-orange-500 text-white shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10'
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