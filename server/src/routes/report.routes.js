const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/report.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/', authMiddleware, ctrl.createReport);
router.get('/my', authMiddleware, ctrl.getMyReports);

module.exports = router;
