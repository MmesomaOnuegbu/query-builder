// components/results/ResultsTable.tsx
import { memo, useState } from 'react'

import { ChevronUp, ChevronDown } from 'lucide-react'
import EmptyState from './EmptyState'
import { MockUser } from '@/mock/data'

type Props = {
  data: MockUser[]
}

type SortConfig = {
  key:       keyof MockUser
  direction: 'asc' | 'desc'
}

const COLUMNS: { key: keyof MockUser; label: string }[] = [
  { key: 'id',         label: 'ID'         },
  { key: 'name',       label: 'Name'       },
  { key: 'email',      label: 'Email'      },
  { key: 'age',        label: 'Age'        },
  { key: 'country',    label: 'Country'    },
  { key: 'status',     label: 'Status'     },
  { key: 'purchases',  label: 'Purchases'  },
  { key: 'spending',   label: 'Spending'   },
  { key: 'isVerified', label: 'Verified'   },
  { key: 'createdAt',  label: 'Created'    },
]

const PAGE_SIZE = 10

function ResultsTable({ data }: Props) {
  const [page, setPage]           = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'id', direction: 'asc',
  })

  // ── Sort ──────────────────────────────────────────────────────
  function handleSort(key: keyof MockUser) {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
    setPage(1)
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    const dir  = sortConfig.direction === 'asc' ? 1 : -1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * dir
    }
    return String(aVal).localeCompare(String(bVal)) * dir
  })

  // ── Paginate ──────────────────────────────────────────────────
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (data.length === 0) return <EmptyState />

  return (
    <div className="rounded-lg border border-border overflow-hidden">

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2 text-left text-xs font-semibold 
                             text-muted-foreground uppercase tracking-wide
                             cursor-pointer hover:text-foreground 
                             select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortConfig.key === col.key ? (
                      sortConfig.direction === 'asc'
                        ? <ChevronUp size={12} />
                        : <ChevronDown size={12} />
                    ) : (
                      <ChevronUp size={12} className="opacity-20" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr
                key={row.id}
                className={`
                  border-b border-border last:border-0
                  hover:bg-muted/30 transition-colors
                  ${i % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                `}
              >
                <td className="px-3 py-2 text-muted-foreground">{row.id}</td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{row.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.email}</td>
                <td className="px-3 py-2">{row.age}</td>
                <td className="px-3 py-2">{row.country}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-3 py-2">{row.purchases}</td>
                <td className="px-3 py-2">${row.spending.toLocaleString()}</td>
                <td className="px-3 py-2">
                  <span className={`
                    text-xs font-medium px-2 py-0.5 rounded-full
                    ${row.isVerified
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }
                  `}>
                    {row.isVerified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {row.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 
                        border-t border-border bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {data.length} results
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 text-xs rounded border border-border
                         disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Prev
            </button>
            {/* page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.min(
                Math.max(page - 2, 1) + i,
                totalPages
              )
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`
                    px-2.5 py-1 text-xs rounded border transition-colors
                    ${page === pageNum
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-border hover:bg-muted'
                    }
                  `}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 text-xs rounded border border-border
                         disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    banned:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] ?? ''}`}>
      {status}
    </span>
  )
}

export default memo(ResultsTable)