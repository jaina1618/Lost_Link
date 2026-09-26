const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/message.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, ctrl.getConversations);
router.get('/request/:requestId', authMiddleware, ctrl.getMessages);
router.post('/request/:requestId', authMiddleware, ctrl.sendMessage);

module.exports = router;
