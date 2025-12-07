import express from 'express'
import db from '../database/init.js'

const router = express.Router()

// Get all documents
router.get('/', (req, res) => {
  try {
    const { lang = 'fr', search } = req.query
    
    let query = `
      SELECT id, title_${lang} as title, description_${lang} as description, 
             icon, processing_time, cost, offline, requirements
      FROM documents 
      WHERE 1=1
    `
    const params = []
    
    if (search) {
      query += ` AND (title_${lang} LIKE ? OR description_${lang} LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }
    
    query += ' ORDER BY title_fr'
    
    const documents = db.prepare(query).all(...params)
    
    // Parse JSON fields
    const formattedDocuments = documents.map(document => ({
      ...document,
      requirements: document.requirements ? JSON.parse(document.requirements) : []
    }))
    
    res.json({
      success: true,
      data: formattedDocuments,
      count: formattedDocuments.length
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    })
  }
})

// Get document by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { lang = 'fr' } = req.query
    
    const query = `
      SELECT id, title_${lang} as title, description_${lang} as description, 
             icon, processing_time, cost, offline, requirements
      FROM documents 
      WHERE id = ?
    `
    
    const document = db.prepare(query).get(id)
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      })
    }
    
    // Parse JSON fields
    const formattedDocument = {
      ...document,
      requirements: document.requirements ? JSON.parse(document.requirements) : []
    }
    
    res.json({
      success: true,
      data: formattedDocument
    })
  } catch (error) {
    console.error('Error fetching document:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document'
    })
  }
})

// Request document
router.post('/request', (req, res) => {
  try {
    const { documentId, userId, data } = req.body
    
    if (!documentId || !userId || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }
    
    // Generate request ID
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Insert request into queue (for offline sync)
    const insertRequest = db.prepare(`
      INSERT INTO offline_queue (user_id, action_type, action_data)
      VALUES (?, 'DOCUMENT_REQUEST', ?)
    `)
    
    insertRequest.run(userId, JSON.stringify({
      requestId,
      documentId,
      data,
      timestamp: new Date().toISOString()
    }))
    
    res.json({
      success: true,
      data: {
        requestId,
        message: 'Document request submitted successfully'
      }
    })
  } catch (error) {
    console.error('Error requesting document:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to request document'
    })
  }
})

// Track document request
router.get('/track/:requestId', (req, res) => {
  try {
    const { requestId } = req.params
    
    // Mock tracking data (in real implementation, this would query actual tracking system)
    const trackingData = {
      requestId,
      status: 'processing',
      statusLabel: {
        fr: 'En cours de traitement',
        ar: 'قيد المعالجة'
      },
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      steps: [
        {
          id: 1,
          title: 'Demande reçue',
          completed: true,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          title: 'Vérification des documents',
          completed: true,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          title: 'Traitement en cours',
          completed: false,
          date: null
        },
        {
          id: 4,
          title: 'Document prêt',
          completed: false,
          date: null
        }
      ]
    }
    
    res.json({
      success: true,
      data: trackingData
    })
  } catch (error) {
    console.error('Error tracking document:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to track document'
    })
  }
})

export default router