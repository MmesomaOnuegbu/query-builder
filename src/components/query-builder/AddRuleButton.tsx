// components/query-builder/AddRuleButton.tsx
import { memo } from 'react'
import { Plus } from 'lucide-react'

type Props = {
  onAdd: () => void
}

function AddRuleButton({ onAdd }: Props) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="
        flex items-center gap-2 px-3 py-2 text-sm font-medium
        rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300
        hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:border-emerald-500
        transition-all duration-200
      "
    >
      <Plus size={14} />
      Add Rule
    </button>
  )
}

export default memo(AddRuleButton)