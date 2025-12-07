import express from 'express'
import { body, validationResult } from 'express-validator'
import db from '../database/init.js'

const router = express.Router()

// Simple AI response endpoint (mock implementation)
router.post('/chat', [
  body('message').isString().isLength({ min: 1, max: 1000 }),
  body('lang').optional().isIn(['fr', 'ar']).default('fr')
], async (req, res) => {
  try {
    // Check validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { message, lang = 'fr' } = req.body
    
    // Simple keyword-based responses (replace with actual AI model)
    const lowerMessage = message.toLowerCase()
    
    let response = {
      type: 'text',
      content: '',
      suggestions: []
    }

    // Check FAQ first
    const faqQuery = db.prepare(`
      SELECT question_${lang} as question, answer_${lang} as answer, category
      FROM faq 
      WHERE question_${lang} LIKE ? OR answer_${lang} LIKE ?
      ORDER BY views DESC
      LIMIT 3
    `)
    
    const faqResults = faqQuery.all(`%${message}%`, `%${message}%`)
    
    if (faqResults.length > 0) {
      // Update view count
      const updateViews = db.prepare(`
        UPDATE faq SET views = views + 1 
        WHERE question_${lang} = ?
      `)
      
      faqResults.forEach(faq => {
        updateViews.run(faq.question)
      })
      
      response.content = faqResults[0].answer
      response.suggestions = faqResults.slice(1).map(f => f.question)
    } else if (lowerMessage.includes('carte') && lowerMessage.includes('identité')) {
      response.content = lang === 'fr' 
        ? 'Pour obtenir une carte d\'identité, vous devez: 1) Remplir le formulaire en ligne, 2) Fournir une photo d\'identité récente, 3) Télécharger un justificatif de domicile.'
        : 'للحصول على بطاقة هوية، يجب عليك: 1) ملء النموذج عبر الإنترنت، 2) تقديم صورة هوية حديثة، 3) تحميل إثبات الإقامة.'
      response.suggestions = lang === 'fr' 
        ? ['Documents nécessaires', 'Où déposer la demande', 'Délai de traitement']
        : ['المستندات المطلوبة', 'أين تقديم الطلب', 'مدة المعالجة']
    } else if (lowerMessage.includes('naissance')) {
      response.content = lang === 'fr'
        ? 'Pour un acte de naissance, contactez la mairie de votre lieu de naissance avec votre pièce d\'identité.'
        : 'للحصول على شهادة ميلاد، اتصل ببلدية مكان ميلادك مع بطاقة هويتك.'
      response.suggestions = lang === 'fr'
        ? ['Mairie en ligne', 'Copie intégrale', 'Extrait avec filiation']
        : ['البلدية عبر الإنترنت', 'نسخة كاملة', 'مستخرج مع القرابة']
    } else if (lowerMessage.includes('école') || lowerMessage.includes('inscription')) {
      response.type = 'suggestions'
      response.content = lang === 'fr' ? 'Voici les types d\'inscription disponibles:' : 'إليك أنواع التسجيل المتوفرة:'
      response.suggestions = lang === 'fr'
        ? ['Inscription primaire', 'Inscription secondaire', 'Inscription universitaire', 'Bourses scolaires']
        : ['التسجيل الابتدائي', 'التسجيل الثانوي', 'التسجيل الجامعي', 'المنح الدراسية']
    } else {
      // Generic response
      response.content = lang === 'fr'
        ? `Je comprends votre question concernant: "${message}". Voici quelques suggestions qui pourraient vous aider:`
        : `أفهم سؤالك بخصوص: "${message}". إليك بعض الاقتراحات التي قد تساعدك:`
      response.suggestions = lang === 'fr'
        ? ['Documents administratifs', 'Démarches en ligne', 'Contactez un service']
        : ['المستندات الإدارية', 'الإجراءات عبر الإنترنت', 'الاتصال بخدمة']
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    res.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('AI chat error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    })
  }
})

// Get AI suggestions
router.get('/suggestions', (req, res) => {
  try {
    const { category, lang = 'fr' } = req.query
    
    let query = `
      SELECT question_${lang} as question, category, views
      FROM faq 
      WHERE 1=1
    `
    const params = []
    
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    
    query += ' ORDER BY views DESC LIMIT 10'
    
    const suggestions = db.prepare(query).all(...params)
    
    res.json({
      success: true,
      data: suggestions.map(s => s.question)
    })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions'
    })
  }
})

// Feedback endpoint
router.post('/feedback', [
  body('messageId').isString(),
  body('helpful').isBoolean(),
  body('lang').optional().isIn(['fr', 'ar']).default('fr')
], (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { messageId, helpful, lang = 'fr' } = req.body
    
    // Update helpful count for FAQ if messageId matches
    const updateHelpful = db.prepare(`
      UPDATE faq 
      SET helpful = helpful + 1 
      WHERE question_${lang} = ? AND helpful >= 0
    `)
    
    const result = updateHelpful.run(messageId)
    
    res.json({
      success: true,
      data: {
        message: 'Feedback recorded successfully',
        updated: result.changes > 0
      }
    })
  } catch (error) {
    console.error('Error recording feedback:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record feedback'
    })
  }
})

export default router