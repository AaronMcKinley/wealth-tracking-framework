import React from 'react';
import Login from './Login';  // Import the Login component

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Welcome to the React App</h1>
      <Login />  {/* Render the Login component */}
    </div>
  );
}

export default App;
