// components/query-builder/AddGroupButton.tsx
import { memo } from 'react'
import { FolderPlus } from 'lucide-react'

type Props = {
  onAdd: () => void
}

function AddGroupButton({ onAdd }: Props) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="
        flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold
        rounded-2xl border border-orange-300 bg-orange-50 text-orange-700
        hover:bg-orange-100 hover:border-orange-400 transition-all duration-200
      "
    >
      <FolderPlus size={14} />
      Add Group
    </button>
  )
}

export default memo(AddGroupButton)