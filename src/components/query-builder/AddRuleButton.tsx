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
        flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
        rounded-md border border-dashed border-blue-400 text-blue-500
        hover:bg-blue-50 dark:hover:bg-blue-950/30
        transition-colors
      "
    >
      <Plus size={13} />
      Add Rule
    </button>
  )
}

export default memo(AddRuleButton)