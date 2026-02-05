import React from 'react';
import PredictionForm from './components/PredictionForm';
import './App.css';

const featureCards = [
  {
    title: 'Multi-Modal Analysis',
    description:
      'Combines cognitive tests, genetics, and MRI indicators for a richer risk profile.',
  },
  {
    title: 'Clinician-Centric Output',
    description:
      'Highlights key risk factors and confidence levels in a format built for quick interpretation.',
  },
  {
    title: 'Early Intervention Support',
    description:
      'Flags elevated-risk patients earlier to help care teams plan treatment pathways proactively.',
  },
];

const workflowSteps = [
  'Enter patient details and latest cognitive assessment values.',
  'Submit data securely for AI-assisted risk scoring.',
  'Review probability score, confidence, and actionable drivers.',
];

function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="hero-eyebrow">CarePulse Platform</p>
        <h1>AI-Powered Early Detection for Alzheimer&apos;s Disease</h1>
        <p className="hero-subtitle">
          Equip clinical teams with a fast, explainable risk estimate using structured patient data.
        </p>
      </header>

      <section className="feature-grid" aria-label="Core platform features">
        {featureCards.map((card) => (
          <article key={card.title} className="feature-card">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="workflow" aria-label="How CarePulse works">
        <h2>How It Works</h2>
        <ol>
          {workflowSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <main className="main-panel">
        <PredictionForm />
      </main>
    </div>
  );
}

export default App;
