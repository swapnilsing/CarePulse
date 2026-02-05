import React, { useMemo, useState } from 'react';

const defaultForm = {
  patientId: '',
  age: '',
  mmse: '',
  cdr: '0',
  apoe4Positive: false,
  hippocampalVolume: '',
};

const riskClassMap = {
  Low: 'risk-badge low',
  Moderate: 'risk-badge moderate',
  High: 'risk-badge high',
};

function PredictionForm() {
  const [formData, setFormData] = useState(defaultForm);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const riskClass = useMemo(() => {
    if (!prediction) {
      return 'risk-badge';
    }
    return riskClassMap[prediction.riskBand] || 'risk-badge';
  }, [prediction]);

  const onChange = (event) => {
    const { name, value, checked, type } = event.target;
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
      return 'MMSE must be in the range of 0 to 30.';
    }

    const cdr = Number(formData.cdr);
    if (![0, 0.5, 1, 2, 3].includes(cdr)) {
      return 'CDR value is invalid.';
    }

    if (formData.hippocampalVolume) {
      const hv = Number(formData.hippocampalVolume);
      if (!Number.isFinite(hv) || hv < 2000 || hv > 7000) {
        return 'Hippocampal volume must be between 2000 and 7000 mm³.';
      }
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPrediction(null);

    const formError = validateForm();
    if (formError) {
      setError(formError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: formData.patientId,
          age: Number(formData.age),
          mmse: Number(formData.mmse),
          cdr: Number(formData.cdr),
          apoe4Positive: formData.apoe4Positive,
          hippocampalVolume: formData.hippocampalVolume ? Number(formData.hippocampalVolume) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction request failed');
      }

      const data = await response.json();
      setPrediction(data);
    } catch (requestError) {
      setError('Unable to complete ML assessment. Please verify backend and Python ML service.');
      // eslint-disable-next-line no-console
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="assessment-form">
        <div className="input-grid">
          <label>
            Patient ID
            <input
              name="patientId"
              value={formData.patientId}
              onChange={onChange}
              placeholder="e.g. HSP-2026-001"
            />
          </label>

          <label>
            Age
            <input
              name="age"
              type="number"
              min="45"
              max="100"
              value={formData.age}
              onChange={onChange}
              placeholder="e.g. 71"
            />
          </label>

          <label>
            MMSE
            <input
              name="mmse"
              type="number"
              min="0"
              max="30"
              value={formData.mmse}
              onChange={onChange}
              placeholder="e.g. 22"
            />
          </label>

          <label>
            CDR
            <select name="cdr" value={formData.cdr} onChange={onChange}>
              <option value="0">0 - Normal</option>
              <option value="0.5">0.5 - Very Mild</option>
              <option value="1">1 - Mild</option>
              <option value="2">2 - Moderate</option>
              <option value="3">3 - Severe</option>
            </select>
          </label>

          <label>
            Hippocampal Volume (mm³)
            <input
              name="hippocampalVolume"
              type="number"
              min="2000"
              max="7000"
              value={formData.hippocampalVolume}
              onChange={onChange}
              placeholder="Optional"
            />
          </label>

          <label className="checkbox-wrap">
            <input
              type="checkbox"
              name="apoe4Positive"
              checked={formData.apoe4Positive}
              onChange={onChange}
            />
            APOE4 Positive
          </label>
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? 'Running ML Assessment...' : 'Generate Clinical Risk Report'}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}

      {prediction ? (
        <section className="result-panel" aria-live="polite">
          <div className="result-head">
            <h3>Risk Report · {prediction.patientId}</h3>
            <span className={riskClass}>{prediction.riskBand}</span>
          </div>

          <div className="result-grid">
            <article>
              <p>Risk Score</p>
              <strong>{(prediction.riskScore * 100).toFixed(1)}%</strong>
            </article>
            <article>
              <p>Model Confidence</p>
              <strong>{prediction.confidence}</strong>
            </article>
            <article>
              <p>Model Version</p>
              <strong>{prediction.modelVersion || 'carepulse-ml-v1'}</strong>
            </article>
          </div>

          <p><strong>Key Factors:</strong> {prediction.keyFactors.join(', ')}</p>
          <p><strong>Clinical Recommendation:</strong> {prediction.recommendation}</p>
        </section>
      ) : null}
    </div>
  );
}

export default PredictionForm;
