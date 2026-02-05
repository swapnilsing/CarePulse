const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    inputs: {
      age: Number,
      mmse: Number,
      cdr: Number,
      apoe4Positive: Boolean,
      hippocampalVolume: Number,
    },
    prediction: {
      riskScore: Number,
      riskBand: String,
      confidence: String,
      keyFactors: [String],
      recommendation: String,
      modelVersion: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
