/**
 * Verification Routes
 * Defines API routes for verification endpoints
 */

const express = require('express');
const router = express.Router();
const { ingestVerifications, healthCheck } = require('../controllers/verificationController');

// Health check endpoint
router.get('/health', healthCheck);

// Verification ingestion endpoint
router.post('/verifications/ingest', ingestVerifications);

module.exports = router;
