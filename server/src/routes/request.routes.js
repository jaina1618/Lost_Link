const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/request.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, ctrl.getMyRequests);
router.post('/', authMiddleware, ctrl.createRequest);
router.get('/:id', authMiddleware, ctrl.getRequestById);
router.patch('/:id/accept', authMiddleware, ctrl.acceptRequest);
router.patch('/:id/reject', authMiddleware, ctrl.rejectRequest);
router.patch('/:id/resolve', authMiddleware, ctrl.resolveRequest);
router.post('/:id/dispute', authMiddleware, ctrl.disputeRequest);

module.exports = router;
