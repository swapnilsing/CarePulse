const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const toPercentage = (value) => `${Math.round(value * 100)}%`;

const scoreRisk = ({ age, mmse, cdr, apoe4Positive }) => {
  let score = 0.1;
  const keyFactors = [];

  if (age >= 75) {
    score += 0.2;
    keyFactors.push('Advanced age profile');
  } else if (age >= 65) {
    score += 0.12;
    keyFactors.push('Age-related neurodegeneration risk');
  }

  if (mmse <= 18) {
    score += 0.35;
    keyFactors.push('Low MMSE cognitive performance');
  } else if (mmse <= 24) {
    score += 0.2;
    keyFactors.push('Borderline MMSE result');
  }

  if (cdr >= 2) {
    score += 0.3;
    keyFactors.push('Elevated CDR severity');
  } else if (cdr >= 1) {
    score += 0.2;
    keyFactors.push('Mild dementia markers (CDR)');
  } else if (cdr === 0.5) {
    score += 0.1;
    keyFactors.push('Very mild CDR impairment');
  }

  if (apoe4Positive) {
    score += 0.15;
    keyFactors.push('APOE4 genetic marker detected');
  }

  const clampedScore = Math.max(0, Math.min(score, 0.98));
  const confidence = 0.7 + (clampedScore * 0.25);

  let riskBand = 'Low';
  let recommendation = 'Maintain annual screening and continue healthy cognitive lifestyle interventions.';

  if (clampedScore >= 0.7) {
    riskBand = 'High';
    recommendation = 'Recommend specialist referral, confirmatory imaging, and close follow-up every 3-6 months.';
  } else if (clampedScore >= 0.4) {
    riskBand = 'Moderate';
    recommendation = 'Recommend deeper neurocognitive testing and follow-up risk assessment within 6 months.';
  }

  return {
    riskScore: Number(clampedScore.toFixed(2)),
    confidence: toPercentage(confidence),
    riskBand,
    keyFactors: keyFactors.length ? keyFactors : ['No high-risk features detected in submitted data'],
    recommendation,
  };
};

app.post('/api/predict', (req, res) => {
  const { patientId, age, mmse, cdr, apoe4Positive } = req.body;

  if (!patientId || Number.isNaN(Number(age)) || Number.isNaN(Number(mmse)) || Number.isNaN(Number(cdr))) {
    return res.status(400).json({ error: 'Missing or invalid patient fields.' });
  }

  const prediction = scoreRisk({
    age: Number(age),
    mmse: Number(mmse),
    cdr: Number(cdr),
    apoe4Positive: Boolean(apoe4Positive),
  });

  return res.json({
    patientId,
    ...prediction,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
