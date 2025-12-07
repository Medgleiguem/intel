import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../../../shared/database/moussadar.db')
const db = new Database(dbPath)

console.log('🌱 Seeding additional data...')

// Add more sample data here
const additionalServices = [
  {
    id: 'driver-license',
    title_fr: 'Permis de conduire',
    title_ar: 'رخصة القيادة',
    description_fr: 'Obtenez ou renouvelez votre permis de conduire',
    description_ar: 'احصل على رخصة القيادة الخاصة بك أو جددها',
    category: 'documents',
    icon: '🚗',
    estimated_time: '20 min',
    difficulty: 'medium',
    cost: '30€',
    offline: 0,
    requirements: JSON.stringify(['Photos', 'Pièce d\'identité', 'Avis médical']),
    steps: JSON.stringify(['Remplir le formulaire', 'Passer l\'examen', 'Obtenir le permis'])
  }
]

const insertService = db.prepare(`
  INSERT OR REPLACE INTO services 
  (id, title_fr, title_ar, description_fr, description_ar, category, icon, estimated_time, difficulty, cost, offline, requirements, steps)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

additionalServices.forEach(service => {
  insertService.run(
    service.id,
    service.title_fr,
    service.title_ar,
    service.description_fr,
    service.description_ar,
    service.category,
    service.icon,
    service.estimated_time,
    service.difficulty,
    service.cost,
    service.offline,
    service.requirements,
    service.steps
  )
})

console.log('✅ Additional data seeded!')
db.close()