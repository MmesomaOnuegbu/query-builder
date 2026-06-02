import { Schema } from "../types/schema";


export const mockSchema: Schema = {
  id: {
    name: 'ID',
    type: 'number',
    min: 1,
  },
  name: {
    name: 'Full Name',
    type: 'string',
    placeholder: 'e.g. Amara Osei',
  },
  email: {
    name: 'Email',
    type: 'string',
    placeholder: 'e.g. amara@gmail.com',
  },
  age: {
    name: 'Age',
    type: 'number',
    min: 18,
    max: 65,
  },
  country: {
    name: 'Country',
    type: 'enum',
    options: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Ethiopia'],
  },
  status: {
    name: 'Status',
    type: 'enum',
    options: ['active', 'inactive', 'pending', 'banned'],
  },
  purchases: {
    name: 'Purchases',
    type: 'number',
    min: 0,
    max: 500,
  },
  spending: {
    name: 'Total Spending ($)',
    type: 'number',
    min: 0,
    max: 50000,
  },
  createdAt: {
    name: 'Created At',
    type: 'date',
  },
  lastLogin: {
    name: 'Last Login',
    type: 'date',
  },
  isVerified: {
    name: 'Verified',
    type: 'boolean',
  },
}