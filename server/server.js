// server/server.js

const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose'); // You'll use this later to connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5001; // Use a different port than React

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// --- API Routes ---
// This is a placeholder for your prediction logic
app.post('/api/predict', (req, res) => {
    // In a real app, you would take req.body data,
    // process it, and send it to your Python ML model.
    console.log('Received data:', req.body);

    // For now, we'll just send back a mock result.
    const mockPrediction = {
        patientId: req.body.patientId,
        riskScore: Math.random().toFixed(2), // Random score between 0 and 1
        confidence: '88%',
        keyFactors: ['Hippocampal Volume', 'MMSE Score'],
    };

    res.json(mockPrediction);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});