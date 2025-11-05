import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './screens/LoginPage';
import SignupPage from './screens/SignupPage';

function App() {
  return (
    <Router>
      <nav style={{ textAlign: 'center', margin: '20px' }}>
        <Link to="/">Login</Link> | <Link to="/signup">Sign Up</Link>
      </nav>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
