import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import "../styles/AuthPages.css";


function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    alert('Signed up successfully! (Mocked)');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join Budget Bliss today</p>

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="icon" />
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
            <span className="toggle" onClick={() => setShowConfirm(!showConfirm)}>
  {showConfirm ? <FaEye /> : <FaEyeSlash />}
</span>

          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span className="toggle" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="auth-btn">Sign Up</button>
        </form>

        <p className="auth-footer">
          Already have an account? <a href="/">Login</a>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
