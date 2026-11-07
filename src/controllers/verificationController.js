/**
 * Verification Controller
 * Handles HTTP requests for verification endpoints
 */

const { processVerificationBatch } = require('../services/verificationService');

/**
 * Handles POST /api/v1/verifications/ingest
 * Processes a batch of verification records
 */
function ingestVerifications(req, res) {
  try {
    // Input validation
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }

    if (!req.body.verifications) {
      return res.status(400).json({
        success: false,
        error: 'verifications field is required'
      });
    }

    if (!Array.isArray(req.body.verifications)) {
      return res.status(400).json({
        success: false,
        error: 'verifications must be an array'
      });
    }

    const verifications = req.body.verifications;

    // Process the batch
    const result = processVerificationBatch(verifications);

    // Return success response with summary
    return res.status(200).json({
      success: true,
      summary: result.summary,
      statusBreakdownByDocumentType: result.statusBreakdownByDocumentType
    });

  } catch (error) {
    console.error('Error processing verifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Handles GET /api/v1/health
 * Health check endpoint
 */
function healthCheck(req, res) {
  return res.status(200).json({
    status: 'ok',
    service: 'Docaroo Verification API'
  });
}

module.exports = {
  ingestVerifications,
  healthCheck
};
