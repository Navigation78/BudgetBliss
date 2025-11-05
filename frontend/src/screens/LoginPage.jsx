import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import '../styles/AuthPages.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const { isSignedIn } = await signIn({ username: email, password });
      setMessage(isSignedIn ? '✅ Login successful!' : '⚠️ Please complete next step.');
    } catch (error) {
      setMessage('❌ Login failed: ' + error.message);
    }
  }

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <p>Enter your credentials to log in</p>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Username or Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login Now</button>
      </form>

      <div className="auth-footer">
        <span className="forgot-password">Forgot password?</span>
        <p>
          Don’t have an account? <a href="/signup">Sign Up</a>
        </p>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default LoginPage;