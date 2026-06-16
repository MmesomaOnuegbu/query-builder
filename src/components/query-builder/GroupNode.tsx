// components/query-builder/GroupNode.tsx
import { memo } from 'react'
import { Group, Rule } from '@/types/query'
import { Schema } from '@/types/schema'
import { ValidationError } from '@/lib/query-validator'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ChevronDown, ChevronRight, Trash2, Ban } from 'lucide-react'
import LogicSelector  from './LogicSelector'
import RuleNode       from './RuleNode'
import AddRuleButton  from './AddRuleButton'
import AddGroupButton from './AddGroupButton'

type Props = {
  group:       Group
  schema:      Schema
  errors:      ValidationError[]
  depth:       number
  isRoot?:     boolean
  onAddRule:   (parentId: string) => void
  onAddGroup:  (parentId: string) => void
  onRemove:    (nodeId: string)   => void
  onUpdateRule:(ruleId: string, updates: Partial<Rule>)  => void
  onUpdateGroup:(groupId: string, updates: Partial<Group>) => void
  onToggleCollapse: (groupId: string) => void
  onReorder:   (groupId: string, fromIndex: number, toIndex: number) => void
}

// depth colors — each nesting level gets a different left border color
const DEPTH_COLORS = [
  'border-l-emerald-600',
  'border-l-orange-500',
  'border-l-purple-500',
  'border-l-pink-500',
  'border-l-cyan-500',
]

function GroupNode({
  group,
  schema,
  errors,
  depth,
  isRoot = false,
  onAddRule,
  onAddGroup,
  onRemove,
  onUpdateRule,
  onUpdateGroup,
  onToggleCollapse,
  onReorder,
}: Props) {

  // ── DnD sensors ───────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ── Handle drag end ───────────────────────────────────────────
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fromIndex = group.children.findIndex(c => c.id === active.id)
    const toIndex   = group.children.findIndex(c => c.id === over.id)

    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(group.id, fromIndex, toIndex)
    }
  }

  const depthColor = DEPTH_COLORS[depth % DEPTH_COLORS.length]
  const childIds   = group.children.map(c => c.id)

  return (
    <div
      className={`
        rounded-[1.5rem] border transition-all
        ${!isRoot ? `border-l-2 ${depthColor}` : ''}
        ${group.negated ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-emerald-200 dark:border-emerald-900/30'}
        ${depth > 0 ? 'ml-4' : ''}
      `}
    >
      {/* ── Group header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-emerald-50/40 dark:bg-emerald-950/20">

        {/* collapse toggle */}
        <button
          type="button"
          onClick={() => onToggleCollapse(group.id)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {group.collapsed
            ? <ChevronRight size={16} />
            : <ChevronDown  size={16} />
          }
        </button>

        {/* logic AND/OR toggle */}
        <LogicSelector
          value={group.logic}
          onChange={logic => onUpdateGroup(group.id, { logic })}
        />

        {/* group label if set */}
        {group.label && (
          <span className="text-xs text-muted-foreground italic">
            {group.label}
          </span>
        )}

        {/* condition count */}
        <span className="text-xs text-muted-foreground ml-1">
          {group.children.length} condition{group.children.length !== 1 ? 's' : ''}
        </span>

        <div className="flex-1" />

        {/* NOT toggle */}
        {!isRoot && (
          <button
            type="button"
            title="Toggle NOT"
            onClick={() => onUpdateGroup(group.id, { negated: !group.negated })}
            className={`
              p-1.5 rounded-md transition-all duration-200
              ${group.negated
                ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30'
                : 'text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
              }
            `}
          >
            <Ban size={14} />
          </button>
        )}

        {/* remove group — not on root */}
        {!isRoot && (
          <button
            type="button"
            title="Remove group"
            onClick={() => onRemove(group.id)}
            className="p-1.5 rounded-md text-muted-foreground 
                       hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 
                       transition-all duration-200"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* ── Group body ───────────────────────────────────────── */}
      {!group.collapsed && (
        <div className="p-4 flex flex-col gap-3">
          <div className="rounded-2xl border border-emerald-200 bg-background px-3 py-2 text-xs text-muted-foreground">
            {group.logic === 'AND'
              ? 'All conditions in this group must match.'
              : 'At least one condition in this group must match.'
            }
          </div>

          {/* empty state */}
          {group.children.length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-2">
              No conditions yet — add a rule or group below
            </p>
          )}

          {/* children with DnD */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={childIds}
              strategy={verticalListSortingStrategy}
            >
              {group.children.map(child => {
                // ── RECURSION ─────────────────────────────────
                // if child is a group → render GroupNode again
                // if child is a rule  → render RuleNode
                if (child.type === 'group') {
                  return (
                    <GroupNode
                      key={child.id}
                      group={child}
                      schema={schema}
                      errors={errors}
                      depth={depth + 1}
                      onAddRule={onAddRule}
                      onAddGroup={onAddGroup}
                      onRemove={onRemove}
                      onUpdateRule={onUpdateRule}
                      onUpdateGroup={onUpdateGroup}
                      onToggleCollapse={onToggleCollapse}
                      onReorder={onReorder}
                    />
                  )
                }

                return (
                  <RuleNode
                    key={child.id}
                    rule={child}
                    schema={schema}
                    errors={errors}
                    onUpdate={onUpdateRule}
                    onRemove={onRemove}
                  />
                )
              })}
            </SortableContext>
          </DndContext>

          {/* ── Footer actions ──────────────────────────────── */}
          <div className="flex items-center gap-2 pt-1">
            <AddRuleButton  onAdd={() => onAddRule(group.id)}  />
            <AddGroupButton onAdd={() => onAddGroup(group.id)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(GroupNode)