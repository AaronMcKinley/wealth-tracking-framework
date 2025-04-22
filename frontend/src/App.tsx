import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>💸 Wealth Tracking Framework</h1>
        <p>Your personal portfolio, tracked and automated.</p>

        <div style={{ marginTop: '2rem' }}>
          <button>Add Investment</button>
          <button style={{ marginLeft: '1rem' }}>View Dashboard</button>
        </div>
      </header>
    </div>
  );
}

export default App;
