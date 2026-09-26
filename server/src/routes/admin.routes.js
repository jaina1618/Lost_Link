const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware, adminMiddleware);

router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.getAllUsers);
router.patch('/users/:id/suspend', ctrl.suspendUser);
router.patch('/users/:id/role', ctrl.changeUserRole);
router.get('/lost', ctrl.getAllLostItems);
router.get('/found', ctrl.getAllFoundItems);
router.delete('/items/:type/:id', ctrl.deleteItem);
router.get('/reports', ctrl.getAllReports);
router.patch('/reports/:id', ctrl.reviewReport);
router.get('/requests', ctrl.getAllRequests);

module.exports = router;
