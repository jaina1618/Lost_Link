const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/foundItem.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', ctrl.getFoundItems);
router.get('/my', authMiddleware, ctrl.getMyFoundItems);
router.get('/:id', ctrl.getFoundItemById);
router.post('/', authMiddleware, upload.single('image'), ctrl.createFoundItem);
router.put('/:id', authMiddleware, upload.single('image'), ctrl.updateFoundItem);
router.delete('/:id', authMiddleware, ctrl.deleteFoundItem);
router.patch('/:id/status', authMiddleware, ctrl.updateStatus);

module.exports = router;
