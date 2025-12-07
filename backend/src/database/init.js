import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure database directory exists
const dbDir = path.join(__dirname, '../../../shared/database')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Database file path
const dbPath = path.join(dbDir, 'moussadar.db')

console.log(`🗄️  Initializing database at: ${dbPath}`)

// Remove existing database if you want a fresh start
if (fs.existsSync(dbPath)) {
  console.log('🔄 Removing existing database...')
  fs.unlinkSync(dbPath)
}

// Create new database
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

console.log('✅ Database created successfully')

// Create tables function
const createTables = () => {
  console.log('📋 Creating tables...')

  // Services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      description_fr TEXT,
      description_ar TEXT,
      category TEXT NOT NULL,
      icon TEXT,
      estimated_time TEXT,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
      cost TEXT,
      offline BOOLEAN DEFAULT 0,
      requirements TEXT,
      steps TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      description_fr TEXT,
      description_ar TEXT,
      icon TEXT,
      processing_time TEXT,
      cost TEXT,
      offline BOOLEAN DEFAULT 0,
      requirements TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Procedures table
  db.exec(`
    CREATE TABLE IF NOT EXISTS procedures (
      id TEXT PRIMARY KEY,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      description_fr TEXT,
      description_ar TEXT,
      category TEXT NOT NULL,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
      estimated_time TEXT,
      cost TEXT,
      offline BOOLEAN DEFAULT 0,
      steps TEXT,
      requirements TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Offline queue table
  db.exec(`
    CREATE TABLE IF NOT EXISTS offline_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action_type TEXT NOT NULL,
      action_data TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced BOOLEAN DEFAULT 0,
      synced_at DATETIME
    )
  `)

  // User preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      language TEXT DEFAULT 'fr' CHECK(language IN ('fr', 'ar')),
      theme TEXT DEFAULT 'light' CHECK(theme IN ('light', 'dark')),
      notifications BOOLEAN DEFAULT 1,
      offline_sync BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // FAQ table
  db.exec(`
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_fr TEXT NOT NULL,
      question_ar TEXT NOT NULL,
      answer_fr TEXT NOT NULL,
      answer_ar TEXT NOT NULL,
      category TEXT,
      tags TEXT,
      views INTEGER DEFAULT 0,
      helpful INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Cache table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('✅ Tables created successfully')
}

// Insert sample data
const insertSampleData = () => {
  console.log('🌱 Inserting sample data...')

  // Sample services
  const services = [
    {
      id: 'id-card',
      title_fr: 'Carte d\'identité',
      title_ar: 'بطاقة الهوية',
      description_fr: 'Obtenez ou renouvelez votre carte d\'identité nationale',
      description_ar: 'احصل على بطاقة هويتك الوطنية أو جددها',
      category: 'documents',
      icon: '🆔',
      estimated_time: '15 min',
      difficulty: 'easy',
      cost: 'Gratuit',
      offline: 1,
      requirements: JSON.stringify(['Photo d\'identité', 'Justificatif de domicile', 'Ancienne carte']),
      steps: JSON.stringify(['Remplir le formulaire', 'Télécharger les documents', 'Valider la demande'])
    },
    {
      id: 'passport',
      title_fr: 'Passeport',
      title_ar: 'جواز السفر',
      description_fr: 'Demandez ou renouvelez votre passeport biométrique',
      description_ar: 'اطلب جواز سفرك الحيوي أو جدده',
      category: 'documents',
      icon: '🛂',
      estimated_time: '30 min',
      difficulty: 'medium',
      cost: '86€',
      offline: 0,
      requirements: JSON.stringify(['Photos passeport', 'Carte d\'identité', 'Justificatif de domicile']),
      steps: JSON.stringify(['Remplir le formulaire', 'Prendre rendez-vous', 'Déposer le dossier'])
    },
    {
      id: 'birth-certificate',
      title_fr: 'Acte de naissance',
      title_ar: 'شهادة الميلاد',
      description_fr: 'Demandez une copie de votre acte de naissance',
      description_ar: 'اطلب نسخة من شهادة ميلادك',
      category: 'documents',
      icon: '👶',
      estimated_time: '10 min',
      difficulty: 'easy',
      cost: 'Gratuit',
      offline: 1,
      requirements: JSON.stringify(['Pièce d\'identité', 'Informations de naissance']),
      steps: JSON.stringify(['Saisir les informations', 'Valider la demande'])
    },
    {
      id: 'school-registration',
      title_fr: 'Inscription scolaire',
      title_ar: 'التسجيل المدرسي',
      description_fr: 'Inscrivez vos enfants dans un établissement public',
      description_ar: 'سجل أطفالك في مؤسسة عامة',
      category: 'education',
      icon: '🎓',
      estimated_time: '20 min',
      difficulty: 'medium',
      cost: 'Gratuit',
      offline: 1,
      requirements: JSON.stringify(['Acte de naissance', 'Justificatif de domicile', 'Photos']),
      steps: JSON.stringify(['Créer un compte', 'Sélectionner l\'établissement', 'Déposer les pièces'])
    }
  ]

  const insertService = db.prepare(`
    INSERT OR REPLACE INTO services 
    (id, title_fr, title_ar, description_fr, description_ar, category, icon, estimated_time, difficulty, cost, offline, requirements, steps)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  services.forEach(service => {
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

  // Sample documents
  const documents = [
    {
      id: 'id-card-doc',
      title_fr: 'Carte d\'identité',
      title_ar: 'بطاقة الهوية',
      description_fr: 'Document d\'identité national',
      description_ar: 'وثيقة الهوية الوطنية',
      icon: '🆔',
      processing_time: '2-3 semaines',
      cost: 'Gratuit',
      offline: 1,
      requirements: JSON.stringify(['Photo d\'identité', 'Justificatif de domicile'])
    },
    {
      id: 'passport-doc',
      title_fr: 'Passeport',
      title_ar: 'جواز السفر',
      description_fr: 'Passeport biométrique',
      description_ar: 'جواز سفر حيوي',
      icon: '🛂',
      processing_time: '2-4 semaines',
      cost: '86€',
      offline: 0,
      requirements: JSON.stringify(['Photos passeport', 'Carte d\'identité', 'Justificatif de domicile'])
    }
  ]

  const insertDocument = db.prepare(`
    INSERT OR REPLACE INTO documents 
    (id, title_fr, title_ar, description_fr, description_ar, icon, processing_time, cost, offline, requirements)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  documents.forEach(document => {
    insertDocument.run(
      document.id,
      document.title_fr,
      document.title_ar,
      document.description_fr,
      document.description_ar,
      document.icon,
      document.processing_time,
      document.cost,
      document.offline,
      document.requirements
    )
  })

  // Sample FAQ
  const faq = [
    {
      question_fr: 'Comment obtenir une carte d\'identité ?',
      question_ar: 'كيفية الحصول على بطاقة هوية؟',
      answer_fr: 'Vous devez remplir le formulaire en ligne, fournir une photo d\'identité récente et un justificatif de domicile.',
      answer_ar: 'يجب عليك ملء النموذج عبر الإنترنت، وتقديم صورة هوية حديثة وإثبات الإقامة.',
      category: 'documents',
      tags: 'carte identité,documents'
    },
    {
      question_fr: 'Quels documents sont nécessaires pour un passeport ?',
      question_ar: 'ما هي المستندات المطلوبة لجواز السفر؟',
      answer_fr: 'Photos passeport, carte d\'identité en cours de validité, et justificatif de domicile.',
      answer_ar: 'صور جواز السفر، بطاقة هوية سارية المفعول، وإثبات الإقامة.',
      category: 'documents',
      tags: 'passeport,documents'
    }
  ]

  const insertFAQ = db.prepare(`
    INSERT OR REPLACE INTO faq 
    (question_fr, question_ar, answer_fr, answer_ar, category, tags)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  faq.forEach(item => {
    insertFAQ.run(
      item.question_fr,
      item.question_ar,
      item.answer_fr,
      item.answer_ar,
      item.category,
      item.tags
    )
  })

  console.log('✅ Sample data inserted successfully')
}

// Run initialization
try {
  createTables()
  insertSampleData()
  
  console.log('🎉 Database initialization complete!')
  console.log(`📊 Database file: ${dbPath}`)
  console.log('✨ You can now start the backend server with: npm run dev')
  
} catch (error) {
  console.error('❌ Database initialization failed:', error)
  process.exit(1)
} finally {
  db.close()
}