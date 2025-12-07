import express from 'express'
import { body, validationResult } from 'express-validator'
import db from '../database/init.js'

const router = express.Router()

// Get all services
router.get('/', (req, res) => {
  try {
    const { category, search, offline, lang = 'fr' } = req.query
    
    let query = `
      SELECT id, title_${lang} as title, description_${lang} as description, 
             category, icon, estimated_time, difficulty, cost, offline, requirements, steps
      FROM services 
      WHERE 1=1
    `
    const params = []
    
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    
    if (offline === 'true') {
      query += ' AND offline = 1'
    }
    
    if (search) {
      query += ` AND (title_${lang} LIKE ? OR description_${lang} LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }
    
    query += ' ORDER BY title_fr'
    
    const services = db.prepare(query).all(...params)
    
    // Parse JSON fields
    const formattedServices = services.map(service => ({
      ...service,
      requirements: service.requirements ? JSON.parse(service.requirements) : [],
      steps: service.steps ? JSON.parse(service.steps) : []
    }))
    
    res.json({
      success: true,
      data: formattedServices,
      count: formattedServices.length
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    })
  }
})

// Get service by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { lang = 'fr' } = req.query
    
    const query = `
      SELECT id, title_${lang} as title, description_${lang} as description, 
             category, icon, estimated_time, difficulty, cost, offline, requirements, steps
      FROM services 
      WHERE id = ?
    `
    
    const service = db.prepare(query).get(id)
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      })
    }
    
    // Parse JSON fields
    const formattedService = {
      ...service,
      requirements: service.requirements ? JSON.parse(service.requirements) : [],
      steps: service.steps ? JSON.parse(service.steps) : []
    }
    
    res.json({
      success: true,
      data: formattedService
    })
  } catch (error) {
    console.error('Error fetching service:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service'
    })
  }
})

// Get service categories
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
      FROM services 
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

export default router