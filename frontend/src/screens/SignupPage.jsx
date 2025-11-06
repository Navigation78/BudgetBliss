import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    alert("Signed up successfully! (Mocked)");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-softBlue px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-royalBlue mb-2 text-center">Create Account</h2>
        <p className="text-gray-600 text-center mb-6">Join Budget Bliss today</p>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Username */}
          <div className="flex items-center border rounded-md px-3 py-2">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Email */}
          <div className="flex items-center border rounded-md px-3 py-2">
            <FaEnvelope className="text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="flex items-center border rounded-md px-3 py-2 relative">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full outline-none text-gray-700 placeholder-gray-400"
            />
            <span
              className="absolute right-3 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border rounded-md px-3 py-2 relative">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full outline-none text-gray-700 placeholder-gray-400"
            />
            <span
              className="absolute right-3 cursor-pointer text-gray-500"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-500 mt-5">
          Already have an account?{" "}
          <a href="/" className="text-blue-600 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
