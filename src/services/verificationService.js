/**
 * Verification Service
 * Processes verification records and calculates aggregations
 */

const { validateVerificationRecord } = require('../validators/verificationValidator');

/**
 * Processes a batch of verification records
 * @param {Array} verifications - Array of verification records
 * @returns {Object} - Processing results with summary and breakdown
 */
function processVerificationBatch(verifications) {
  const processedRecords = [];
  let validRecords = 0;
  let totalRiskScore = 0;
  let riskScoreCount = 0;

  // Process each记录
  for (const record of verifications) {
    const validation = validateVerificationRecord(record);
    
    const processedRecord = {
      VerificationID: record.VerificationID,
      UserReference: record.UserReference,
      DocumentType: record.DocumentType,
      SubmissionDate: record.SubmissionDate,
      ExpiryDate: record.ExpiryDate,
      Status: record.Status,
      RiskScore: record.RiskScore,
      valid: validation.valid,
      errors: validation.errors
    };

    processedRecords.push(processedRecord);

    // Track valid records and risk scores
    if (validation.valid) {
      validRecords++;
      // Only include valid risk scores in average (0-100 range)
      const riskScore = Number(record.RiskScore);
      if (!isNaN(riskScore)) {
        totalRiskScore += riskScore;
        riskScoreCount++;
      }
    }
  }

  // Calculate aggregations
  const totalRecords = verifications.length;
  const passRatePercentage = totalRecords > 0 
    ? Math.round((validRecords / totalRecords) * 100) 
    : 0;
  
  const averageRiskScore = riskScoreCount > 0 
    ? Math.round(totalRiskScore / riskScoreCount) 
    : 0;

  // Build status breakdown by DocumentType
  const statusBreakdownByDocumentType = buildStatusBreakdown(processedRecords);

  return {
    processedRecords,
    summary: {
      totalRecordsProcessed: totalRecords,
      passRatePercentage,
      averageRiskScore
    },
    statusBreakdownByDocumentType
  };
}

/**
 * Builds status breakdown grouped by DocumentType
 * @param {Array} processedRecords - Array of processed verification records
 * @returns {Object} - Status breakdown by DocumentType
 */
function buildStatusBreakdown(processedRecords) {
  const breakdown = {};

  for (const record of processedRecords) {
    const docType = record.DocumentType;
    const status = record.valid ? record.Status : 'Invalid';

    if (!breakdown[docType]) {
      breakdown[docType] = {};
    }

    if (!breakdown[docType][status]) {
      breakdown[docType][status] = 0;
    }

    breakdown[docType][status]++;
  }

  return breakdown;
}

module.exports = {
  processVerificationBatch
};
