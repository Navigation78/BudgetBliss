import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import '../styles/AuthPages.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
  e.preventDefault();

  // Mock authentication
  const mockUser = {
    email: email,
    isLoggedIn: true,
  };

  // Save user session locally
  localStorage.setItem('user', JSON.stringify(mockUser));

  // Redirect to home
  window.location.href = '/Home';
};


  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Enter your credentials to log in</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="toggle" onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? <FaEye /> : <FaEyeSlash />}
</span>

          </div>

          <button type="submit" className="auth-btn">Login Now</button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
