// types/query.ts

export type RuleValue = string | number | string[] | [string, string] | null

export type Rule = {
  id: string
  type: 'rule'
  field: string
  operator: string
  value: RuleValue
  negated?: boolean        // for NOT conditions
}

export type Group = {
  id: string
  type: 'group'
  logic: 'AND' | 'OR'
  children: QueryNode[]    // ← the recursion lives here
  collapsed?: boolean      // for collapsible UI
  label?: string           // optional group label
  negated?: boolean        // for NOT conditions on groups
}

export type QueryNode = Rule | Group

export type Preset = {
  id: string
  name: string
  query: Group
  createdAt: string
}

export type QueryState = {
  root: Group
  history: Group[]
  savedPresets: Preset[]
}