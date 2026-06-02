// mock/data.ts

export type MockUser = {
  id: number
  name: string
  email: string
  age: number
  country: string
  status: string
  purchases: number
  spending: number
  createdAt: string
  lastLogin: string
  isVerified: boolean
}

const countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Ethiopia']
const statuses  = ['active', 'inactive', 'pending', 'banned']
const firstNames = [
  'Amara', 'Fatima', 'Chidi', 'Ngozi', 'Kwame', 'Abena',
  'Yusuf', 'Aisha', 'Emeka', 'Zainab', 'Kofi', 'Ama',
  'Tunde', 'Bisi', 'Seun', 'Kemi', 'Femi', 'Sola',
  'Musa', 'Halima', 'Ibrahim', 'Rukayat', 'Dele', 'Shade',
]
const lastNames = [
  'Osei', 'Bello', 'Mensah', 'Nwosu', 'Asante', 'Diallo',
  'Kamara', 'Okonkwo', 'Agyei', 'Adeyemi', 'Owusu', 'Musa',
  'Traoré', 'Coulibaly', 'Sow', 'Barry', 'Keita', 'Cissé',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime()
  const end   = new Date(endYear, 11, 31).getTime()
  return new Date(start + Math.random() * (end - start))
    .toISOString()
    .split('T')[0]
}

// generate 300 records — enough to stress test filtering
export const mockData: MockUser[] = Array.from({ length: 300 }, (_, i) => {
  const firstName = randomItem(firstNames)
  const lastName  = randomItem(lastNames)
  const country   = randomItem(countries)
  const status    = randomItem(statuses)
  const purchases = randomInt(0, 500)

  return {
    id:         i + 1,
    name:       `${firstName} ${lastName}`,
    email:      `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
    age:        randomInt(18, 65),
    country,
    status,
    purchases,
    spending:   purchases * randomInt(10, 200),
    createdAt:  randomDate(2020, 2023),
    lastLogin:  randomDate(2023, 2024),
    isVerified: Math.random() > 0.3,
  }
})