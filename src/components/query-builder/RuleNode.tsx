// components/query-builder/RuleNode.tsx
import { memo } from 'react'
import { Rule } from '../types/query'
import { Schema } from '../types/schema'
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
        flex items-center gap-2 p-2 rounded-lg border bg-card
        group transition-colors
        ${rule.negated ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-border'}
        ${isDragging ? 'shadow-lg z-50' : ''}
      `}
    >
      {/* drag handle */}
      <button
        type="button"
        className="text-muted-foreground opacity-0 group-hover:opacity-100 
                   cursor-grab active:cursor-grabbing transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>

      {/* NOT badge */}
      {rule.negated && (
        <span className="text-xs font-bold text-red-500 shrink-0">NOT</span>
      )}

      {/* field */}
      <FieldSelector
        value={rule.field}
        schema={schema}
        onChange={handleFieldChange}
        error={fieldError}
      />

      {/* operator */}
      <OperatorSelector
        field={rule.field}
        value={rule.operator}
        schema={schema}
        onChange={handleOperatorChange}
        error={operatorError}
      />

      {/* value */}
      <ValueInput
        field={rule.field}
        operator={rule.operator}
        value={rule.value}
        schema={schema}
        onChange={value => onUpdate(rule.id, { value })}
        error={valueError}
      />

      {/* actions */}
      <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        {/* toggle NOT */}
        <button
          type="button"
          title="Toggle NOT"
          onClick={() => onUpdate(rule.id, { negated: !rule.negated })}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <Ban size={13} />
        </button>

        {/* remove */}
        <button
          type="button"
          title="Remove rule"
          onClick={() => onRemove(rule.id)}
          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 
                     text-muted-foreground hover:text-red-500"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}

export default memo(RuleNode)