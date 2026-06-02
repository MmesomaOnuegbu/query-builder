// components/query-builder/QueryPreview.tsx
import { memo } from 'react'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

type Props = {
  sql:          string
  mongo:        string
  activePreview: 'sql' | 'mongo'
  onSwitch:     (val: 'sql' | 'mongo') => void
}

function QueryPreview({ sql, mongo, activePreview, onSwitch }: Props) {
  const [copied, setCopied] = useState(false)

  const text = activePreview === 'sql' ? sql : mongo

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">

      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Query Preview
        </span>

        <div className="flex items-center gap-2">
          {/* SQL / Mongo toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
            {(['sql', 'mongo'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onSwitch(type)}
                className={`
                  px-2.5 py-1 text-xs font-medium rounded transition-colors
                  ${activePreview === type
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {type === 'sql' ? 'SQL' : 'Mongo'}
              </button>
            ))}
          </div>

          {/* copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground 
                       hover:text-foreground transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* code block */}
      <pre
        className="p-4 text-xs font-mono text-foreground overflow-x-auto
                   max-h-[240px] overflow-y-auto leading-relaxed"
      >
        {text || '-- empty query'}
      </pre>
    </div>
  )
}

export default memo(QueryPreview)