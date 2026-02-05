const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Assessment = require('./models/Assessment');

const app = express();
const PORT = process.env.PORT || 5001;
const PYTHON_BIN = process.env.PYTHON_BIN || 'python3';

app.use(cors());
app.use(express.json());

const validatePayload = (body) => {
  const { patientId, age, mmse, cdr } = body;
  if (!patientId || typeof patientId !== 'string') {
    return 'Patient ID is required.';
  }

  if (!Number.isFinite(Number(age)) || Number(age) < 45 || Number(age) > 100) {
    return 'Age must be between 45 and 100.';
  }

  if (!Number.isFinite(Number(mmse)) || Number(mmse) < 0 || Number(mmse) > 30) {
    return 'MMSE must be between 0 and 30.';
  }

  if (!Number.isFinite(Number(cdr)) || ![0, 0.5, 1, 2, 3].includes(Number(cdr))) {
    return 'CDR must be one of 0, 0.5, 1, 2, or 3.';
  }

  if (body.hippocampalVolume !== null && body.hippocampalVolume !== undefined) {
    const hv = Number(body.hippocampalVolume);
    if (!Number.isFinite(hv) || hv < 2000 || hv > 7000) {
      return 'Hippocampal volume must be between 2000 and 7000.';
    }
  }

  return '';
};

const runMlInference = (payload) => new Promise((resolve, reject) => {
  const scriptPath = path.join(__dirname, 'ml', 'predictor.py');
  const worker = spawn(PYTHON_BIN, [scriptPath]);

  let stdout = '';
  let stderr = '';

  worker.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  worker.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  worker.on('error', (error) => {
    reject(error);
  });

  worker.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(stderr || `ML worker exited with code ${code}`));
      return;
    }

    try {
      const parsed = JSON.parse(stdout);
      resolve(parsed);
    } catch (error) {
      reject(new Error(`Invalid ML JSON output: ${error.message}`));
    }
  });

  worker.stdin.write(JSON.stringify(payload));
  worker.stdin.end();
});

const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('MongoDB connected. Assessments will be persisted.');
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
    });
} else {
  console.log('MONGODB_URI is not set. Running without persistence layer.');
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CarePulse API',
    mlEngine: 'Python predictor',
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

app.post('/api/predict', async (req, res) => {
  const validationError = validatePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const payload = {
    patientId: req.body.patientId.trim(),
    age: Number(req.body.age),
    mmse: Number(req.body.mmse),
    cdr: Number(req.body.cdr),
    apoe4Positive: Boolean(req.body.apoe4Positive),
    hippocampalVolume: req.body.hippocampalVolume === null || req.body.hippocampalVolume === undefined
      ? null
      : Number(req.body.hippocampalVolume),
  };

  try {
    const prediction = await runMlInference(payload);

    if (mongoose.connection.readyState === 1) {
      Assessment.create({
        patientId: payload.patientId,
        inputs: {
          age: payload.age,
          mmse: payload.mmse,
          cdr: payload.cdr,
          apoe4Positive: payload.apoe4Positive,
          hippocampalVolume: payload.hippocampalVolume,
        },
        prediction,
      }).catch((error) => {
        console.error('Failed to persist assessment:', error.message);
      });
    }

    return res.json({ patientId: payload.patientId, ...prediction });
  } catch (error) {
    console.error('Prediction error:', error.message);
    return res.status(500).json({
      error: 'ML prediction service failed.',
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`CarePulse server is running on port ${PORT}`);
});
