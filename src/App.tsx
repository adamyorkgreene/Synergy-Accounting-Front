import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Logo from './assets/synergylogo.png';

function App() {

  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  return (
      <div className="app">
        <header className="app-header">
          <img src={Logo} alt={"Synergy"} className="logo" />
          {isRegistering ? (
              <div className="container2">
                  <Register/>
                  <button onClick={() => setIsRegistering(false)}
                          className="custom-button">Already have an account?
                  </button>
              </div>
          ) : (
              <div className="container">
                  <Login/>
                  <button onClick={() => setIsRegistering(true)}
                          className="custom-button">Don't have an account?
                  </button>
              </div>
          )}
        </header>
      </div>
  );
}

export default App;