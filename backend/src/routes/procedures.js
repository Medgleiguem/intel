import express from 'express'
import db from '../database/init.js'

const router = express.Router()

// Get all procedures
router.get('/', (req, res) => {
  try {
    const { lang = 'fr', category, difficulty, search } = req.query
    
    let query = `
      SELECT id, title_${lang} as title, description_${lang} as description, 
             category, difficulty, estimated_time, cost, offline, steps, requirements
      FROM procedures 
      WHERE 1=1
    `
    const params = []
    
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    
    if (difficulty) {
      query += ' AND difficulty = ?'
      params.push(difficulty)
    }
    
    if (search) {
      query += ` AND (title_${lang} LIKE ? OR description_${lang} LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }
    
    query += ' ORDER BY title_fr'
    
    const procedures = db.prepare(query).all(...params)
    
    // Parse JSON fields
    const formattedProcedures = procedures.map(procedure => ({
      ...procedure,
      steps: procedure.steps ? JSON.parse(procedure.steps) : [],
      requirements: procedure.requirements ? JSON.parse(procedure.requirements) : []
    }))
    
    res.json({
      success: true,
      data: formattedProcedures,
      count: formattedProcedures.length
    })
  } catch (error) {
    console.error('Error fetching procedures:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch procedures'
    })
  }
})

// Get procedure by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { lang = 'fr' } = req.query
    
    const query = `
      SELECT id, title_${lang} as title, description_${lang} as description, 
             category, difficulty, estimated_time, cost, offline, steps, requirements
      FROM procedures 
      WHERE id = ?
    `
    
    const procedure = db.prepare(query).get(id)
    
    if (!procedure) {
      return res.status(404).json({
        success: false,
        error: 'Procedure not found'
      })
    }
    
    // Parse JSON fields
    const formattedProcedure = {
      ...procedure,
      steps: procedure.steps ? JSON.parse(procedure.steps) : [],
      requirements: procedure.requirements ? JSON.parse(procedure.requirements) : []
    }
    
    res.json({
      success: true,
      data: formattedProcedure
    })
  } catch (error) {
    console.error('Error fetching procedure:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch procedure'
    })
  }
})

// Get procedure categories
router.get('/categories/list', (req, res) => {
  try {
    const { lang = 'fr' } = req.query
    
    const categories = db.prepare(`
      SELECT DISTINCT category, 
             CASE 
               WHEN category = 'documents' THEN '${lang === 'fr' ? 'Documents' : 'مستندات'}'
               WHEN category = 'education' THEN '${lang === 'fr' ? 'Éducation' : 'التعليم'}'
               WHEN category = 'health' THEN '${lang === 'fr' ? 'Santé' : 'الصحة'}'
               WHEN category = 'taxes' THEN '${lang === 'fr' ? 'Impôts' : 'الضرائب'}'
               WHEN category = 'social' THEN '${lang === 'fr' ? 'Social' : 'الاجتماعي'}'
               WHEN category = 'transport' THEN '${lang === 'fr' ? 'Transport' : 'النقل'}'
               ELSE category
             END as label
      FROM procedures 
      ORDER BY category
    `).all()
    
    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    })
  }
})

// Start procedure
router.post('/start', (req, res) => {
  try {
    const { procedureId, userId, data } = req.body
    
    if (!procedureId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }
    
    // Generate session ID
    const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Insert session into queue (for offline sync)
    const insertSession = db.prepare(`
      INSERT INTO offline_queue (user_id, action_type, action_data)
      VALUES (?, 'PROCEDURE_START', ?)
    `)
    
    insertSession.run(userId, JSON.stringify({
      sessionId,
      procedureId,
      data,
      timestamp: new Date().toISOString(),
      currentStep: 0,
      status: 'started'
    }))
    
    res.json({
      success: true,
      data: {
        sessionId,
        message: 'Procedure started successfully'
      }
    })
  } catch (error) {
    console.error('Error starting procedure:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to start procedure'
    })
  }
})

// Update procedure progress
router.put('/progress/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params
    const { currentStep, status, data } = req.body
    
    // Update progress in queue
    const updateProgress = db.prepare(`
      UPDATE offline_queue 
      SET action_data = json_set(action_data, '$.currentStep', ?, '$.status', ?, '$.data', ?)
      WHERE json_extract(action_data, '$.sessionId') = ? AND action_type = 'PROCEDURE_START'
    `)
    
    const result = updateProgress.run(currentStep, status, JSON.stringify(data), sessionId)
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Procedure session not found'
      })
    }
    
    res.json({
      success: true,
      data: {
        message: 'Progress updated successfully'
      }
    })
  } catch (error) {
    console.error('Error updating procedure progress:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update procedure progress'
    })
  }
})

export default router