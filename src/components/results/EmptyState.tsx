// components/results/EmptyState.tsx
import { SearchX } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center 
                    py-16 rounded-lg border border-dashed border-border">
      <SearchX size={32} className="text-muted-foreground mb-3 opacity-50" />
      <p className="text-sm font-medium text-muted-foreground">
        No results match your query
      </p>
      <p className="text-xs text-muted-foreground mt-1 opacity-70">
        Try adjusting your filters or switching AND to OR
      </p>
    </div>
  )
}