const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, ctrl.getNotifications);
router.get('/unread-count', authMiddleware, ctrl.getUnreadCount);
router.patch('/read-all', authMiddleware, ctrl.markAllRead);
router.patch('/:id/read', authMiddleware, ctrl.markAsRead);
router.delete('/:id', authMiddleware, ctrl.deleteNotification);

module.exports = router;
