require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const { generateHomeReport } = require('./GenerateReport'); // Ensure the path is correct

const app = express();

// Middleware to parse URL-encoded bodies (for Google Forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON bodies (if Zapier or other services send JSON)
app.use(express.json());

// Webhook endpoint to receive data from the form (Zapier, Google Forms, etc.)
app.post('/webhook', async (req, res) => {
    console.log('Webhook received:', req.body);  // Logs incoming data

    // Extract data from the request body
    const { name, email, phone, address } = req.body;

    // Log the data to verify if it's coming correctly
    console.log('Extracted Data:', { name, email, phone, address });

    try {
        // Call the Puppeteer function to generate the report
        await generateHomeReport(address, name, email, phone);
        
        // Respond back to the client (Zapier, Google Forms, etc.)
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
