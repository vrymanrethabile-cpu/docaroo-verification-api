/**
 * Server Entry Point
 * Starts the Express server
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Docaroo Verification API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`Ingest endpoint: http://localhost:${PORT}/api/v1/verifications/ingest`);
});
