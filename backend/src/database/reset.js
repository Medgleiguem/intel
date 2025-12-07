import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../../../shared/database/moussadar.db')

console.log('🔄 Resetting database...')

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log('✅ Database removed')
} else {
  console.log('ℹ️  No database file found')
}

console.log('🔄 Database reset complete. Run `npm run db:init` to recreate.')