import React from 'react';
import PredictionForm from './components/PredictionForm';
import './App.css';

const serviceCards = [
  {
    title: 'Neurology Decision Support',
    detail: 'ML-backed triage scoring designed for memory clinics and multidisciplinary care teams.',
  },
  {
    title: 'Explainable Clinical Insights',
    detail: 'Every prediction includes top contributing factors and practical next-step guidance.',
  },
  {
    title: 'Hospital-Ready Workflow',
    detail: 'Structured intake aligned with typical clinical intake and follow-up routines.',
  },
];

const hospitalMetrics = [
  { label: 'Avg. Assessment Time', value: '2.4 min' },
  { label: 'Integrated Risk Signals', value: '6+' },
  { label: 'Clinical Confidence Range', value: '70-95%' },
];

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">✚</span>
          <div>
            <p className="brand-name">CarePulse Hospital AI</p>
            <p className="brand-sub">Neurology & Cognitive Health Command Center</p>
          </div>
        </div>
        <button type="button" className="status-chip">HIPAA-Ready Workflow</button>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">Clinical Intelligence Platform</p>
          <h1>Early Alzheimer&apos;s Risk Detection for Hospital Teams</h1>
          <p>
            CarePulse combines MERN-based care workflows with a Python ML scoring service to help
            clinicians prioritize high-risk patients, improve follow-up precision, and document explainable results.
          </p>
          <div className="hero-metrics">
            {hospitalMetrics.map((metric) => (
              <article key={metric.label} className="metric-card">
                <p>{metric.value}</p>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="service-grid" aria-label="CarePulse services">
        {serviceCards.map((service) => (
          <article className="service-card" key={service.title}>
            <h2>{service.title}</h2>
            <p>{service.detail}</p>
          </article>
        ))}
      </section>

      <main className="main-layout">
        <section className="panel clinical-panel">
          <h2>Clinical Intake & Risk Assessment</h2>
          <p>
            Enter structured patient findings below. The backend routes to a Python-based ML model,
            then returns explainable output through the CarePulse API.
          </p>
          <PredictionForm />
        </section>

        <aside className="panel aside-panel" aria-label="Clinical protocol guidance">
          <h3>Hospital Protocol Snapshot</h3>
          <ul>
            <li>Collect baseline MMSE, CDR, and age-stratified context.</li>
            <li>Record APOE4 and hippocampal trend signals when available.</li>
            <li>Escalate moderate/high-risk patients to specialist pathways.</li>
            <li>Document reassessment windows in 3-6 month intervals.</li>
          </ul>

          <div className="security-note">
            <p>Security & Audit</p>
            <span>
              Prediction requests are auditable and can be persisted to MongoDB when
              <code> MONGODB_URI </code>
              is configured.
            </span>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
