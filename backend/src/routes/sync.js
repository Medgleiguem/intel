import express from 'express'
import db from '../database/init.js'

const router = express.Router()

// Sync offline data
router.post('/offline', (req, res) => {
  try {
    const { userId, actions } = req.body
    
    if (!userId || !Array.isArray(actions)) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId or actions array'
      })
    }
    
    const syncedActions = []
    
    actions.forEach(action => {
      try {
        // Insert each action into offline queue
        const insertAction = db.prepare(`
          INSERT INTO offline_queue (user_id, action_type, action_data)
          VALUES (?, ?, ?)
        `)
        
        insertAction.run(userId, action.type, JSON.stringify(action.data))
        
        syncedActions.push({
          originalAction: action,
          synced: true,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error syncing action:', error)
        syncedActions.push({
          originalAction: action,
          synced: false,
          error: error.message
        })
      }
    })
    
    res.json({
      success: true,
      data: {
        syncedCount: syncedActions.filter(a => a.synced).length,
        failedCount: syncedActions.filter(a => !a.synced).length,
        actions: syncedActions
      }
    })
  } catch (error) {
    console.error('Error syncing offline data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to sync offline data'
    })
  }
})

// Get pending sync items
router.get('/pending/:userId', (req, res) => {
  try {
    const { userId } = req.params
    
    const pendingItems = db.prepare(`
      SELECT id, action_type, action_data, timestamp
      FROM offline_queue 
      WHERE user_id = ? AND synced = 0
      ORDER BY timestamp ASC
    `).all(userId)
    
    res.json({
      success: true,
      data: pendingItems.map(item => ({
        ...item,
        action_data: JSON.parse(item.action_data)
      }))
    })
  } catch (error) {
    console.error('Error fetching pending sync items:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending sync items'
    })
  }
})

// Mark items as synced
router.put('/synced', (req, res) => {
  try {
    const { itemIds } = req.body
    
    if (!Array.isArray(itemIds)) {
      return res.status(400).json({
        success: false,
        error: 'itemIds must be an array'
      })
    }
    
    const markAsSynced = db.prepare(`
      UPDATE offline_queue 
      SET synced = 1, synced_at = CURRENT_TIMESTAMP
      WHERE id = ? AND synced = 0
    `)
    
    let updatedCount = 0
    
    itemIds.forEach(itemId => {
      const result = markAsSynced.run(itemId)
      updatedCount += result.changes
    })
    
    res.json({
      success: true,
      data: {
        updatedCount,
        message: `${updatedCount} items marked as synced`
      }
    })
  } catch (error) {
    console.error('Error marking items as synced:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to mark items as synced'
    })
  }
})

// Get sync statistics
router.get('/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params
    
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN synced = 1 THEN 1 ELSE 0 END) as synced_items,
        SUM(CASE WHEN synced = 0 THEN 1 ELSE 0 END) as pending_items,
        MIN(timestamp) as oldest_item,
        MAX(timestamp) as newest_item
      FROM offline_queue 
      WHERE user_id = ?
    `).get(userId)
    
    const recentActions = db.prepare(`
      SELECT action_type, COUNT(*) as count
      FROM offline_queue 
      WHERE user_id = ? AND timestamp > datetime('now', '-7 days')
      GROUP BY action_type
      ORDER BY count DESC
    `).all(userId)
    
    res.json({
      success: true,
      data: {
        stats,
        recentActions,
        syncRate: stats.total_items > 0 ? (stats.synced_items / stats.total_items * 100).toFixed(2) : 0
      }
    })
  } catch (error) {
    console.error('Error fetching sync stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sync statistics'
    })
  }
})

export default router