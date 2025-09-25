// client/src/components/PredictionForm.js

import React, { useState } from 'react';
import axios from 'axios';

function PredictionForm() {
  const [patientId, setPatientId] = useState('');
  const [mriData, setMriData] = useState(null); // For file uploads
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPrediction(null);

    // Basic validation
    if (!patientId) {
      setError('Patient ID is required.');
      return;
    }

    try {
      // NOTE: We are sending JSON, not the actual file yet.
      // File upload requires a more complex setup (e.g., multipart/form-data).
      const response = await axios.post('http://localhost:5001/api/predict', {
        patientId: patientId,
        // In a real app, you'd also send cognitive scores, etc.
      });
      setPrediction(response.data);
    } catch (err) {
      setError('Failed to get a prediction. The server might be down.');
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patientId">Patient ID</label>
          <input
            type="text"
            id="patientId"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="e.g., P-12345"
          />
        </div>
        <div className="form-group">
          <label htmlFor="mriScan">Upload MRI Scan</label>
          <input
            type="file"
            id="mriScan"
            onChange={(e) => setMriData(e.target.files[0])}
          />
        </div>
        <button type="submit">Analyze & Predict</button>
      </form>

      {error && <p className="error">{error}</p>}

      {prediction && (
        <div className="results">
          <h3>Prediction Results for {prediction.patientId}</h3>
          <p><strong>Risk Score:</strong> {prediction.riskScore}</p>
          <p><strong>Confidence:</strong> {prediction.confidence}</p>
          <p><strong>Key Contributing Factors:</strong> {prediction.keyFactors.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default PredictionForm;