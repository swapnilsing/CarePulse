import React, { useState } from 'react';
const initialForm = {
  patientId: '',
  age: '',
  mmse: '',
  cdr: '0',
  apoe4Positive: false,
};

function PredictionForm() {
  const [formData, setFormData] = useState(initialForm);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.patientId.trim()) {
      return 'Patient ID is required.';
    }

    const age = Number(formData.age);
    if (!Number.isFinite(age) || age < 45 || age > 100) {
      return 'Age must be between 45 and 100.';
    }

    const mmse = Number(formData.mmse);
    if (!Number.isFinite(mmse) || mmse < 0 || mmse > 30) {
      return 'MMSE score must be between 0 and 30.';
    }

    const cdr = Number(formData.cdr);
    if (![0, 0.5, 1, 2, 3].includes(cdr)) {
      return 'CDR must be one of: 0, 0.5, 1, 2, 3.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPrediction(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          mmse: Number(formData.mmse),
          cdr: Number(formData.cdr),
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setPrediction(data);
    } catch (requestError) {
      setError('Failed to get a prediction. Please verify that the API server is running.');
      // eslint-disable-next-line no-console
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-container" aria-label="Prediction form">
      <h2>Risk Assessment</h2>
      <p className="form-intro">
        Enter recent patient indicators to generate an explainable Alzheimer&apos;s risk estimate.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="patientId">Patient ID</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              placeholder="e.g., P-12345"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              min="45"
              max="100"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g., 72"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mmse">MMSE Score (0-30)</label>
            <input
              type="number"
              id="mmse"
              name="mmse"
              min="0"
              max="30"
              value={formData.mmse}
              onChange={handleChange}
              placeholder="e.g., 21"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cdr">CDR Score</label>
            <select id="cdr" name="cdr" value={formData.cdr} onChange={handleChange}>
              <option value="0">0 - Normal</option>
              <option value="0.5">0.5 - Very Mild</option>
              <option value="1">1 - Mild</option>
              <option value="2">2 - Moderate</option>
              <option value="3">3 - Severe</option>
            </select>
          </div>
        </div>

        <div className="form-group checkbox-row">
          <input
            type="checkbox"
            id="apoe4Positive"
            name="apoe4Positive"
            checked={formData.apoe4Positive}
            onChange={handleChange}
          />
          <label htmlFor="apoe4Positive">APOE4 marker present</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing…' : 'Analyze & Predict'}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      {prediction ? (
        <article className="results" aria-live="polite">
          <h3>Prediction Results: {prediction.patientId}</h3>
          <p>
            <strong>Risk Band:</strong> {prediction.riskBand}
          </p>
          <p>
            <strong>Risk Score:</strong> {(prediction.riskScore * 100).toFixed(1)}%
          </p>
          <p>
            <strong>Model Confidence:</strong> {prediction.confidence}
          </p>
          <p>
            <strong>Top Contributing Factors:</strong> {prediction.keyFactors.join(', ')}
          </p>
          <p>
            <strong>Recommendation:</strong> {prediction.recommendation}
          </p>
        </article>
      ) : null}
    </section>
  );
}

export default PredictionForm;
