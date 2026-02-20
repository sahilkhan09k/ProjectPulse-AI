const express = require('express');
const router = express.Router();
const {
  getAllRisks,
  getRiskById,
  resolveRisk
} = require('../controllers/risk.controller');
const { verifyJwt } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(verifyJwt);

// Routes
router.get('/', getAllRisks);
router.get('/:id', getRiskById);
router.patch('/:id/resolve', resolveRisk);

module.exports = router;
