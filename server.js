const express = require('express');
const bodyParser = require('body-parser');
const { generateHomeReport } = require('./GenerateReport');
require('dotenv').config();  // Ensure environment variables are loaded

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// POST route to generate the report
app.post('/generate-report', async (req, res) => {
  const { address, name, email, phone } = req.body;

  // Make sure the necessary data is passed in the request
  if (!address || !name || !email || !phone) {
    return res.status(400).send('Missing required fields');
  }

  try {
    // Call the report generation function
    await generateHomeReport(address, name, email, phone);
    res.status(200).send('Report generated successfully');
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send('Error generating report');
  }
});

// Server listens on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
