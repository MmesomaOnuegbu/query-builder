
# Visual Query Builder

A highly interactive visual query builder that allows users to construct complex database queries through a graphical interface — no raw SQL required.

## Live Demo
[Add your Vercel URL here]

## Architecture Overview

The application is built around a **recursive tree data structure** where every query is a tree of `Group` and `Rule` nodes.
Group (AND/OR)
├── Rule (field, operator, value)
├── Rule (field, operator, value)
└── Group (AND/OR)
├── Rule
└── Rule


### Folder Structure
src/
├── app/               # Next.js app router
├── components/
│   ├── query-builder/ # All query builder UI components
│   └── results/       # Results table and empty state
├── constants/         # Operator definitions per field type
├── hooks/             # useQueryBuilder hook
├── lib/               # Pure logic — executor, generator, validator, utils
├── mock/              # Mock schema and 300 generated records
├── store/             # Zustand state management
├── tests/             # Vitest test suite (56 tests)
└── types/             # TypeScript type definitions


## Recursive Rendering Strategy

`GroupNode.tsx` is the recursive component. When mapping over `group.children`:
- If a child is a `Rule` → renders `<RuleNode>`
- If a child is a `Group` → renders `<GroupNode>` (itself) with `depth + 1`

This continues indefinitely, supporting unlimited nesting depth. The `depth` prop controls visual indentation and border color so users can distinguish nesting levels at a glance.

## State Management

Zustand was chosen for its minimal boilerplate and built-in support for immutable updates. The store holds:

- `root` — the query tree (a single root `Group` node)
- `history` — array of previous root states (max 30) for undo
- `future` — array of undone states for redo
- `savedPresets` — named saved queries

Every mutation pushes the current root to `history` before applying changes, enabling full undo/redo support.

## Query Engine Design

Three separate pure functions handle query processing:

- **`query-executor.ts`** — recursively walks the tree and filters the mock dataset using JavaScript. Supports all operators including `between`, `in`, `isNull` and negation.
- **`query-generator.ts`** — converts the tree to SQL or MongoDB query syntax for the live preview panel. Updates in real time as the user builds their query.
- **`query-validator.ts`** — validates the tree before execution, catching empty groups, missing fields, invalid operators and incompatible type/operator combinations. Errors are tied to node IDs for inline display.

## Performance Optimization

- Every component wrapped in `React.memo` to prevent sibling re-renders
- `useMemo` in `useQueryBuilder` ensures SQL preview, Mongo preview, validation and results only recompute when `root` changes
- `recursive-utils.ts` updates only the changed node using immutable spreading — the rest of the tree is untouched
- Stable `id` fields on every node ensure React's reconciler only re-renders changed nodes
- Results table uses pagination (10 rows per page) to avoid rendering all 300 records at once
- Debounce-ready architecture — value inputs are isolated components so keystrokes don't trigger full tree re-renders

## Trade-offs Made

- **Mock data over real DB** — keeps focus on frontend architecture as required by the brief; the executor uses plain JavaScript filtering which is faster than a network round trip for this dataset size
- **Zustand over Redux** — less boilerplate, sufficient for this scale, easier to reason about with recursive state
- **No virtualization** — pagination handles large result sets adequately at 300 records; virtualization would be the next step for datasets above 10,000 rows
- **SQL and Mongo preview** — both formats generated from the same tree traversal, giving users flexibility without duplicating logic
- **Prompt-based import/export** — uses browser `prompt()` for simplicity; a modal would be the production approach

## Testing

56 tests across 4 files using Vitest and React Testing Library:

- `query-executor.test.ts` — 18 tests covering all operators, AND/OR logic, nested groups and negation
- `query-generator.test.ts` — 13 tests covering SQL and Mongo output for all operator types
- `validator.test.ts` — 12 tests covering empty groups, missing fields, invalid ranges and edge cases
- `recursive-utils.test.ts` — 13 tests covering add, remove, update, reorder and immutability

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Zustand** — state management
- **TailwindCSS** — styling
- **dnd-kit** — drag and drop
- **Vitest** — testing
- **React Testing Library** — component testing
- **Framer Motion** — animations
- **Lucide React** — icons
- **nanoid** — unique ID generation
