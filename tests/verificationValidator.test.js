/**
 * Tests for Verification Validator
 * Tests all validation rules according to Byte Orbit requirements
 */

const { validateVerificationRecord } = require('../src/validators/verificationValidator');

describe('Verification Validator', () => {
  
  // Test 1: Valid verification record
  test('Test 1: Valid verification record should pass', () => {
    const validRecord = {
      VerificationID: 'VER-001',
      UserReference: 'USER-1001',
      DocumentType: 'National ID',
      SubmissionDate: '2026-09-01',
      ExpiryDate: '2027-09-01',
      Status: 'Verified',
      RiskScore: 25
    };

    const result = validateVerificationRecord(validRecord);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  // Test 2: RiskScore below 0
  test('Test 2: RiskScore below 0 should be invalid', () => {
    const invalidRecord = {
      VerificationID: 'VER-002',
      UserReference: 'USER-1002',
      DocumentType: 'National ID',
      SubmissionDate: '2026-09-01',
      ExpiryDate: '2027-09-01',
      Status: 'Verified',
      RiskScore: -5
    };

    const result = validateVerificationRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('RiskScore must be between 0 and 100');
  });

  // Test 3: RiskScore above 100
  test('Test 3: RiskScore above 100 should be invalid', () => {
    const invalidRecord = {
      VerificationID: 'VER-003',
      UserReference: 'USER-1003',
      DocumentType: 'National ID',
      SubmissionDate: '2026-09-01',
      ExpiryDate: '2027-09-01',
      Status: 'Verified',
      RiskScore: 101
    };

    const result = validateVerificationRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('RiskScore must be between 0 and 100');
  });

  // Test 4: Missing required field
  test('Test 4: Missing required field should be invalid', () => {
    const invalidRecord = {
      VerificationID: 'VER-004',
      UserReference: 'USER-1004',
      DocumentType: 'National ID',
      SubmissionDate: '2026-09-01',
      ExpiryDate: '2027-09-01',
      Status: 'Verified'
      // RiskScore is missing
    };

    const result = validateVerificationRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('RiskScore is required and cannot be null, missing, or empty');
  });

  // Test 5: SubmissionDate later than ExpiryDate
  test('Test 5: SubmissionDate later than ExpiryDate should be invalid', () => {
    const invalidRecord = {
      VerificationID: 'VER-005',
      UserReference: 'USER-1005',
      DocumentType: 'National ID',
      SubmissionDate: '2026-10-01',
      ExpiryDate: '2026-09-01',
      Status: 'Verified',
      RiskScore: 25
    };

    const result = validateVerificationRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('SubmissionDate cannot be later than ExpiryDate');
  });

  // Test: Empty required field
  test('Empty required field should be invalid', () => {
    const invalidRecord = {
      VerificationID: '',
      UserReference: 'USER-1006',
      DocumentType: 'National ID',
      SubmissionDate: '2026-09-01',
      ExpiryDate: '2027-09-01',
      Status: 'Verified',
      RiskScore: 25
    };

    const result = validateVerificationRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('VerificationID is required and cannot be null, missing, or empty');
  });

  // Test: Null required field
  test('Null required field should be invalid', () => {
    const invalidRecord = {
      VerificationID: null,
      UserReference: 'USER-1007',
      DocumentType: 'National ID',
      SubmissionDate: '2026-09-01',
      ExpiryDate: '2027-09-01',
      Status: 'Verified',
      RiskScore: 25
    };

    const result = validateVerificationRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('VerificationID is required and cannot be null, missing, or empty');
  });

  // Test: Invalid date format
  test('Invalid date format should be invalid', () => {
    const invalidRecord = {
      VerificationID: 'VER-008',
      UserReference: 'USER-1008',
      DocumentType: 'National ID',
      SubmissionDate: '01-09-2026',
      ExpiryDate: '2027-09-01',
      Status: 'Verified',
      RiskScore: 25
    };

    const result = validateVerificationRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('SubmissionDate must be a valid date in YYYY-MM-DD format');
  });

  // Test: Malformed date (invalid day)
  test('Malformed date with invalid day should be invalid', () => {
    const invalidRecord = {
      VerificationID: 'VER-009',
      UserReference: 'USER-1009',
      DocumentType: 'National ID',
      SubmissionDate: '2026-02-30',
      ExpiryDate: '2027-09-01',
      Status: 'Verified',
      RiskScore: 25
    };

    const result = validateVerificationRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('SubmissionDate must be a valid date in YYYY-MM-DD format');
  });

  // Test: Multiple validation errors
  test('Multiple validation errors should all be reported', () => {
    const invalidRecord = {
      VerificationID: 'VER-010',
      UserReference: 'USER-1010',
      DocumentType: 'National ID',
      SubmissionDate: '2026-10-01',
      ExpiryDate: '2026-09-01',
      Status: 'Verified',
      RiskScore: 150
    };

    const result = validateVerificationRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
    expect(result.errors).toContain('RiskScore must be between 0 and 100');
    expect(result.errors).toContain('SubmissionDate cannot be later than ExpiryDate');
  });

  // Test: RiskScore at boundary (0)
  test('RiskScore at boundary 0 should be valid', () => {
    const validRecord = {
      VerificationID: 'VER-011',
      UserReference: 'USER-1011',
      DocumentType: 'National ID',
      SubmissionDate: '2026-09-01',
      ExpiryDate: '2027-09-01',
      Status: 'Verified',
      RiskScore: 0
    };

    const result = validateVerificationRecord(validRecord);
    expect(result.valid).toBe(true);
  });

  // Test: RiskScore at boundary (100)
  test('RiskScore at boundary 100 should be valid', () => {
    const validRecord = {
      VerificationID: 'VER-012',
      UserReference: 'USER-1012',
      DocumentType: 'National ID',
      SubmissionDate: '2026-09-01',
      ExpiryDate: '2027-09-01',
      Status: 'Verified',
      RiskScore: 100
    };

    const result = validateVerificationRecord(validRecord);
    expect(result.valid).toBe(true);
  });

  // Test: Same submission and expiry date
  test('Same submission and expiry date should be valid', () => {
    const validRecord = {
      VerificationID: 'VER-013',
      UserReference: 'USER-1013',
      DocumentType: 'National ID',
      SubmissionDate: '2026-09-01',
      ExpiryDate: '2026-09-01',
      Status: 'Verified',
      RiskScore: 25
    };

    const result = validateVerificationRecord(validRecord);
    expect(result.valid).toBe(true);
  });
});
