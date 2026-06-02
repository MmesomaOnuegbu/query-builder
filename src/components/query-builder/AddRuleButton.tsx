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
        flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold
        rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-700
        hover:bg-emerald-100 hover:border-emerald-400 transition-all duration-200
      "
    >
      <Plus size={14} />
      Add Rule
    </button>
  )
}

export default memo(AddRuleButton)