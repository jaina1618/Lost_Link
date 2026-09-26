const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lostItem.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', ctrl.getLostItems);
router.get('/my', authMiddleware, ctrl.getMyLostItems);
router.get('/:id', ctrl.getLostItemById);
router.post('/', authMiddleware, upload.single('image'), ctrl.createLostItem);
router.put('/:id', authMiddleware, upload.single('image'), ctrl.updateLostItem);
router.delete('/:id', authMiddleware, ctrl.deleteLostItem);
router.patch('/:id/status', authMiddleware, ctrl.updateStatus);

module.exports = router;
