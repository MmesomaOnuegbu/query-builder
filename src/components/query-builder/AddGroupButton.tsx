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
        flex items-center gap-2 px-3 py-2 text-sm font-medium
        rounded-lg border-2 border-dashed border-orange-400 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300
        hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-500
        transition-all duration-200
      "
    >
      <FolderPlus size={14} />
      Add Group
    </button>
  )
}

export default memo(AddGroupButton)