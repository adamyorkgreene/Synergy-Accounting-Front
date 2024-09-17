import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  // State to track whether to show the login or register screen
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  return (
      <div className="App">
        <header className="App-header">
          <h1>Welcome to Synergy</h1>

          {/* Conditionally render Login or Register components */}
          {isRegistering ? (
              <div>
                <Register />
                <button onClick={() => setIsRegistering(false)}>Already have an account? Login</button>
              </div>
          ) : (
              <div>
                <Login />
                <button onClick={() => setIsRegistering(true)}>Don't have an account? Register</button>
              </div>
          )}
        </header>
      </div>
  );
}

export default App;