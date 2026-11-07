# Docaroo Verification Intake & Compliance API

A lightweight RESTful API service that accepts batches of identity/document verification records, validates them according to business rules, and returns a structured summary of the verification batch.

## Description

This API is designed to process verification records in batches, applying validation rules to ensure data integrity and providing aggregated statistics about the processed records. It demonstrates REST API design, input validation, business logic implementation, JSON processing, and data aggregation.

## Technologies

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JavaScript** - Programming language
- **REST API** - API architecture
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library for testing
- **Helmet** - Security middleware
- **dotenv** - Environment variable management

## Installation

1. Navigate to the project directory:
```bash
cd docaroo-verification-api
```

2. Install dependencies:
```bash
npm install
```

## Running the API

Start the server:
```bash
npm start
```

Or for development:
```bash
npm run dev
```

The API will start on port 3000 (configurable via .env file).

## API Endpoints

### Health Check
```http
GET /api/v1/health
```

Returns the health status of the API service.

### Verification Ingestion
```http
POST /api/v1/verifications/ingest
```

Accepts a batch of verification records for validation and processing.

## Request Example

```json
{
  "verifications": [
    {
      "VerificationID": "VER-001",
      "UserReference": "USER-1001",
      "DocumentType": "National ID",
      "SubmissionDate": "2026-09-01",
      "ExpiryDate": "2027-09-01",
      "Status": "Verified",
      "RiskScore": 25
    },
    {
      "VerificationID": "VER-002",
      "UserReference": "USER-1002",
      "DocumentType": "Proof of Address",
      "SubmissionDate": "2026-09-02",
      "ExpiryDate": "2027-09-02",
      "Status": "Pending",
      "RiskScore": 40
    }
  ]
}
```

## Response Example

```json
{
  "success": true,
  "summary": {
    "totalRecordsProcessed": 2,
    "passRatePercentage": 100,
    "averageRiskScore": 32
  },
  "statusBreakdownByDocumentType": {
    "National ID": {
      "Verified": 1
    },
    "Proof of Address": {
      "Pending": 1
    }
  }
}
```

## Validation Rules

### Rule 1 — Risk Score
- `RiskScore` must be between 0 and 100 (inclusive)
- Values below 0 or above 100 are marked as invalid

### Rule 2 — Submission Date vs Expiry Date
- `SubmissionDate` must NOT be later than `ExpiryDate`
- If SubmissionDate > ExpiryDate, the record is marked as invalid

### Rule 3 — Required Fields
The following fields are required and cannot be null, missing, or empty:
- VerificationID
- UserReference
- DocumentType
- SubmissionDate
- ExpiryDate
- Status
- RiskScore

### Date Validation
- Dates must be in YYYY-MM-DD format
- Malformed or invalid dates result in an invalid record

## Pass Rate Formula

Pass rate is calculated as:
```
(valid records / total records) × 100
```

The result is rounded to the nearest whole number. If there are zero records, the pass rate is 0%.

**Note:** Only records that pass all validation rules are counted as valid.

## Average Risk Score Calculation

The average RiskScore is calculated from valid records only:
```
(sum of valid RiskScores) / (number of valid records)
```

The result is rounded to the nearest whole number. Invalid RiskScores (outside 0-100 range) are excluded from the calculation to prevent distortion of the average.

## Testing

Run all tests:
```bash
npm test
```

The test suite includes:
- Unit tests for validation rules
- Integration tests for API endpoints
- Tests for batch processing
- Tests for aggregation calculations

## Project Structure

```
docaroo-verification-api/
│
├── src/
│   ├── controllers/          # HTTP request handlers
│   │   └── verificationController.js
│   ├── routes/              # API route definitions
│   │   └── verificationRoutes.js
│   ├── services/            # Business logic
│   │   └── verificationService.js
│   ├── validators/          # Input validation
│   │   └── verificationValidator.js
│   └── app.js               # Express app configuration
│
├── data/                    # Data directory (for future use)
├── tests/                   # Test files
│   ├── verificationValidator.test.js
│   └── api.test.js
│
├── .env                     # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── README.md                # This file
└── server.js                # Server entry point
```

## Assumptions

1. **No Database Required:** The assignment focuses on API ingestion, validation, and aggregation rather than persistence. No database is used.

2. **Date Format:** All dates are expected in YYYY-MM-DD format. This is the only format accepted for simplicity and consistency.

3. **Document Types:** The API does not hard-code specific document types. Any DocumentType value is accepted, making the system flexible for future document types.

4. **RiskScore Handling:** Invalid RiskScores (outside 0-100) are excluded from average calculations to maintain data integrity.

5. **Batch Processing:** All records in a batch are processed regardless of individual record validity. Invalid records do not stop processing of valid records.

6. **Status Values:** The API does not validate specific Status values (e.g., "Verified", "Pending", "Rejected"). Any status value is accepted and grouped accordingly.

7. **Error Handling:** The API returns appropriate HTTP status codes (200, 400, 500) with descriptive JSON error messages.

8. **Security:** Basic security measures are implemented using Helmet middleware. No authentication is required per assignment scope.

9. **Environment:** Configuration is managed through .env file for port and environment settings.

10. **Testing:** Jest and Supertest are used for testing as they are beginner-friendly and widely adopted in the Node.js ecosystem.

## How to Test with Postman

1. Start the server: `npm start`

2. Test health check:
   - Method: GET
   - URL: `http://localhost:3000/api/v1/health`

3. Test verification ingestion:
   - Method: POST
   - URL: `http://localhost:3000/api/v1/verifications/ingest`
   - Headers: `Content-Type: application/json`
   - Body: Use the request example provided above

4. Test with invalid data:
   - Try sending a RiskScore of -5 or 101
   - Try sending a SubmissionDate later than ExpiryDate
   - Try omitting required fields
   - Observe the validation errors in the response

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Request body is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## License

ISC
