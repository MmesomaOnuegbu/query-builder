// components/query-builder/RuleNode.tsx
import { memo } from 'react'
import { Rule } from '@/types/query'
import { Schema } from '@/types/schema'
import { ValidationError } from '@/lib/query-validator'
import { getDefaultOperator, getDefaultValue } from '@/lib/schema-utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Ban } from 'lucide-react'
import FieldSelector    from './FieldSelector'
import OperatorSelector from './OperatorSelector'
import ValueInput       from './ValueInput'
import { getNodeError } from '@/lib/query-validator'

type Props = {
  rule:      Rule
  schema:    Schema
  errors:    ValidationError[]
  onUpdate:  (ruleId: string, updates: Partial<Rule>) => void
  onRemove:  (ruleId: string) => void
}

function RuleNode({ rule, schema, errors, onUpdate, onRemove }: Props) {
  // ── Drag and drop ─────────────────────────────────────────────
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id })

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.5 : 1,
  }

  // ── Field change — reset operator and value ───────────────────
  function handleFieldChange(field: string) {
    const operator = getDefaultOperator(schema, field)
    const value    = getDefaultValue(schema, field, operator)
    onUpdate(rule.id, { field, operator, value })
  }

  // ── Operator change — reset value ────────────────────────────
  function handleOperatorChange(operator: string) {
    const value = getDefaultValue(schema, rule.field, operator)
    onUpdate(rule.id, { operator, value })
  }

  const fieldError    = getNodeError(errors, rule.id)
  const operatorError = !rule.operator ? 'Required' : undefined
  const valueError    = fieldError && !rule.field ? fieldError : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-card
        group transition-all shadow-sm hover:shadow-md
        ${rule.negated ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-emerald-200 dark:border-emerald-900/30'}
        ${isDragging ? 'shadow-lg z-50 ring-2 ring-emerald-400' : ''}
      `}
    >
      {/* drag handle */}
      <button
        type="button"
        className="text-muted-foreground opacity-0 group-hover:opacity-100 
                   cursor-grab active:cursor-grabbing transition-opacity shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      {/* NOT badge */}
      {rule.negated && (
        <span className="text-xs font-bold px-2 py-1 bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded shrink-0">NOT</span>
      )}

      {/* field */}
      <div className="flex items-start gap-1">
        <FieldSelector
          value={rule.field}
          schema={schema}
          onChange={handleFieldChange}
          error={fieldError}
        />
      </div>

      {/* operator */}
      <div className="flex items-start gap-1">
        <OperatorSelector
          field={rule.field}
          value={rule.operator}
          schema={schema}
          onChange={handleOperatorChange}
          error={operatorError}
        />
      </div>

      {/* value */}
      <div className="flex items-start gap-1">
        <ValueInput
          field={rule.field}
          operator={rule.operator}
          value={rule.value}
          schema={schema}
          onChange={value => onUpdate(rule.id, { value })}
          error={valueError}
        />
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {/* toggle NOT */}
        <button
          type="button"
          title="Toggle NOT"
          onClick={() => onUpdate(rule.id, { negated: !rule.negated })}
          className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <Ban size={14} />
        </button>

        {/* remove */}
        <button
          type="button"
          title="Remove rule"
          onClick={() => onRemove(rule.id)}
          className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}

export default memo(RuleNode)