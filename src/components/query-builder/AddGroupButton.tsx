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
        flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
        rounded-md border border-dashed border-orange-400 text-orange-500
        hover:bg-orange-50 dark:hover:bg-orange-950/30
        transition-colors
      "
    >
      <FolderPlus size={13} />
      Add Group
    </button>
  )
}

export default memo(AddGroupButton)