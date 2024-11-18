require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const { generateHomeReport } = require('./GenerateReport'); // Ensure the path is correct

const app = express();

// Middleware to parse URL-encoded bodies (for Google Forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Alternatively, if you still want to accept JSON as well:
app.use(express.json());

// Webhook endpoint to receive data from Google Forms
app.post('/webhook', async (req, res) => {
    console.log('Webhook received:', req.body);  // Logs incoming data

    // Extract data from the request body
    const { name, email, phone, address } = req.body;

    try {
        // Call the Puppeteer function to generate the report
        await generateHomeReport(address, name, email, phone);
        res.status(200).send('Report generation started');  // Sends a confirmation response
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).send('Failed to generate report'); // Sends an error response
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
