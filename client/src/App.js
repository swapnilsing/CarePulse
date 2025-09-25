// client/src/App.js

import React from 'react';
import PredictionForm from './components/PredictionForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>✨ CarePulse ✨</h1>
        <p>AI-Powered Early Detection for Alzheimer's Disease</p>
      </header>
      <main>
        <PredictionForm />
      </main>
    </div>
  );
}

export default App;