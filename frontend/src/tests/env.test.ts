import { describe, it, expect } from 'vitest'

const requiredEnvVars = [
  'VITE_API_URL'
]

describe('Environment Variables', () => {
  it('should have all required environment variables defined', () => {
    const missingVars = requiredEnvVars.filter((key) => !import.meta.env[key])
    
    expect(missingVars, `
❌ Missing environment variables: ${missingVars.join(', ')}

Please make sure you have a .env file at the root of frontend folder and includes all required variables.

Example:
${requiredEnvVars.map(key => `${key}=your_value_here`).join('\n')}
    `).toEqual([])
  })
})
