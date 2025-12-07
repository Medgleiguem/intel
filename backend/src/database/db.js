import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database file path
const dbPath = path.join(__dirname, '../../../shared/database/moussadar.db')

// Create database connection
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL')

export default db