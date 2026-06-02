// types/schema.ts

export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'

export type FieldDefinition = {
  name: string           // display label e.g. "Full Name"
  type: FieldType        // drives which operators + input show up
  options?: string[]     // only for enum type
  placeholder?: string   // hint text in value input
  min?: number           // only for number type
  max?: number           // only for number type
}

export type Schema = Record<string, FieldDefinition>