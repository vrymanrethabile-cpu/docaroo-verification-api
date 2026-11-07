/**
 * Integration Tests for API Endpoints
 * Tests the complete API functionality including batch processing
 */

const request = require('supertest');
const app = require('../src/app');

describe('API Integration Tests', () => {
  
  // Test 9: Empty batch
  test('Test 9: Empty batch should return zero values', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest')
      .send({ verifications: [] });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.summary.totalRecordsProcessed).toBe(0);
    expect(response.body.summary.passRatePercentage).toBe(0);
    expect(response.body.summary.averageRiskScore).toBe(0);
    expect(response.body.statusBreakdownByDocumentType).toEqual({});
  });

  // Test 6: Multiple records in one batch
  test('Test 6: Multiple records in one batch should all be processed', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest')
      .send({
        verifications: [
          {
            VerificationID: 'VER-001',
            UserReference: 'USER-001',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 20
          },
          {
            VerificationID: 'VER-002',
            UserReference: 'USER-002',
            DocumentType: 'Proof of Address',
            SubmissionDate: '2026-09-02',
            ExpiryDate: '2027-09-02',
            Status: 'Pending',
            RiskScore: 40
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.summary.totalRecordsProcessed).toBe(2);
    expect(response.body.summary.passRatePercentage).toBe(100);
    expect(response.body.summary.averageRiskScore).toBe(30);
  });

  // Test 7: Correct pass rate calculation
  test('Test 7: Pass rate calculation should be correct with mixed valid/invalid', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest')
      .send({
        verifications: [
          {
            VerificationID: 'VER-001',
            UserReference: 'USER-001',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 20
          },
          {
            VerificationID: 'VER-002',
            UserReference: 'USER-002',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 30
          },
          {
            VerificationID: 'VER-003',
            UserReference: 'USER-003',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 40
          },
          {
            VerificationID: 'VER-004',
            UserReference: 'USER-004',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: -5 // Invalid
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.summary.totalRecordsProcessed).toBe(4);
    expect(response.body.summary.passRatePercentage).toBe(75); // 3/4 = 75%
  });

  // Test 8: Correct status grouping by DocumentType
  test('Test 8: Status grouping by DocumentType should be correct', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest')
      .send({
        verifications: [
          {
            VerificationID: 'VER-001',
            UserReference: 'USER-001',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 20
          },
          {
            VerificationID: 'VER-002',
            UserReference: 'USER-002',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Pending',
            RiskScore: 30
          },
          {
            VerificationID: 'VER-003',
            UserReference: 'USER-003',
            DocumentType: 'Proof of Address',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 40
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.statusBreakdownByDocumentType['National ID']).toEqual({
      Verified: 1,
      Pending: 1
    });
    expect(response.body.statusBreakdownByDocumentType['Proof of Address']).toEqual({
      Verified: 1
    });
  });

  // Test 10: Health endpoint
  test('Test 10: Health endpoint should return ok status', async () => {
    const response = await request(app)
      .get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('Docaroo Verification API');
  });

  // Test: Missing request body
  test('Missing request body should return 400', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Request body is required');
  });

  // Test: Missing verifications field
  test('Missing verifications field should return 400', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('verifications field is required');
  });

  // Test: verifications not an array
  test('verifications not an array should return 400', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest')
      .send({ verifications: 'hello' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('verifications must be an array');
  });

  // Test: Invalid records should not affect valid ones
  test('Invalid records should not prevent processing of valid records', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest')
      .send({
        verifications: [
          {
            VerificationID: 'VER-001',
            UserReference: 'USER-001',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 20
          },
          {
            VerificationID: 'VER-002',
            UserReference: 'USER-002',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 150 // Invalid
          },
          {
            VerificationID: 'VER-003',
            UserReference: 'USER-003',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 30
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.summary.totalRecordsProcessed).toBe(3);
    expect(response.body.summary.passRatePercentage).toBe(67); // 2/3 rounded
    expect(response.body.statusBreakdownByDocumentType['National ID']).toEqual({
      Verified: 2,
      Invalid: 1
    });
  });

  // Test: Average risk score should exclude invalid values
  test('Average risk score should exclude invalid RiskScore values', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest')
      .send({
        verifications: [
          {
            VerificationID: 'VER-001',
            UserReference: 'USER-001',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 20
          },
          {
            VerificationID: 'VER-002',
            UserReference: 'USER-002',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 40
          },
          {
            VerificationID: 'VER-003',
            UserReference: 'USER-003',
            DocumentType: 'National ID',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 60
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body.summary.averageRiskScore).toBe(40); // (20+40+60)/3 = 40
  });

  // Test: Dynamic DocumentType handling
  test('API should handle new DocumentType values', async () => {
    const response = await request(app)
      .post('/api/v1/verifications/ingest')
      .send({
        verifications: [
          {
            VerificationID: 'VER-001',
            UserReference: 'USER-001',
            DocumentType: 'Business Registration',
            SubmissionDate: '2026-09-01',
            ExpiryDate: '2027-09-01',
            Status: 'Verified',
            RiskScore: 25
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body.statusBreakdownByDocumentType['Business Registration']).toEqual({
      Verified: 1
    });
  });
});
