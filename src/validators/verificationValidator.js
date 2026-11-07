/**
 * Verification Validator
 * Validates verification records according to business rules
 */

const REQUIRED_FIELDS = [
  'VerificationID',
  'UserReference',
  'DocumentType',
  'SubmissionDate',
  'ExpiryDate',
  'Status',
  'RiskScore'
];

/**
 * Validates a single verification record
 * @param {Object} record - The verification record to validate
 * @returns {Object} - Validation result with valid flag and errors array
 */
function validateVerificationRecord(record) {
  const errors = [];

  // Rule 3: Check for missing required fields
  for (const field of REQUIRED_FIELDS) {
    if (record[field] === null || record[field] === undefined || record[field] === '') {
      errors.push(`${field} is required and cannot be null, missing, or empty`);
    }
  }

  // Rule 1: Validate RiskScore (must be between 0 and 100)
  if (record.RiskScore !== null && record.RiskScore !== undefined && record.RiskScore !== '') {
    const riskScore = Number(record.RiskScore);
    if (isNaN(riskScore) || riskScore < 0 || riskScore > 100) {
      errors.push('RiskScore must be between 0 and 100');
    }
  }

  // Rule 2: Validate SubmissionDate vs ExpiryDate
  if (record.SubmissionDate && record.ExpiryDate) {
    const submissionDate = parseDate(record.SubmissionDate);
    const expiryDate = parseDate(record.ExpiryDate);

    if (submissionDate && expiryDate) {
      if (submissionDate > expiryDate) {
        errors.push('SubmissionDate cannot be later than ExpiryDate');
      }
    } else {
      // Date parsing failed
      if (!submissionDate) {
        errors.push('SubmissionDate must be a valid date in YYYY-MM-DD format');
      }
      if (!expiryDate) {
        errors.push('ExpiryDate must be a valid date in YYYY-MM-DD format');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Parses a date string in YYYY-MM-DD format
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
function parseDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  // Check if the date matches YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return null;
  }

  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return null;
  }

  // Verify the parsed date matches the input (prevents dates like 2026-02-30)
  const [year, month, day] = dateString.split('-').map(Number);
  if (date.getFullYear() !== year || 
      date.getMonth() + 1 !== month || 
      date.getDate() !== day) {
    return null;
  }

  return date;
}

module.exports = {
  validateVerificationRecord,
  REQUIRED_FIELDS
};
