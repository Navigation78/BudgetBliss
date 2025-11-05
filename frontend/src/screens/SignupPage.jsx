import React, { useState } from 'react';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import '../styles/AuthPages.css';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState('signup');
  const [message, setMessage] = useState('');

  async function handleSignup(e) {
    e.preventDefault();
    try {
      await signUp({ username: email, password });
      setStage('confirm');
      setMessage('✅ Check your email for the confirmation code.');
    } catch (error) {
      setMessage('❌ Signup failed: ' + error.message);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setMessage('🎉 Signup confirmed! You can now log in.');
    } catch (error) {
      setMessage('❌ Confirmation failed: ' + error.message);
    }
  }

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <p>Create your account</p>

      {stage === 'signup' ? (
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
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
          <button type="submit">Sign Up</button>
        </form>
      ) : (
        <form onSubmit={handleConfirm}>
          <input
            type="text"
            placeholder="Confirmation Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit">Confirm Signup</button>
        </form>
      )}

      <div className="auth-footer">
        <p>
          Already have an account? <a href="/">Login</a>
        </p>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default SignupPage;