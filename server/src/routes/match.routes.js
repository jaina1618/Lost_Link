const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/match.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, ctrl.getMyMatches);
router.get('/:id', authMiddleware, ctrl.getMatchById);
router.patch('/:id/dismiss', authMiddleware, ctrl.dismissMatch);

module.exports = router;
