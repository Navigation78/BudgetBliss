import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    const mockUser = {
      email,
      isLoggedIn: true,
    };

    localStorage.setItem("user", JSON.stringify(mockUser));
    window.location.href = "/Home";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-softBlue px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-royalBlue mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-600 text-center mb-6">Enter your credentials to log in</p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="flex items-center border rounded-md px-3 py-2">
            <FaUser className="text-gray-400 mr-2" />
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

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
          >
            Login Now
          </button>
        </form>

        <p className="text-center text-gray-500 mt-5">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 font-medium hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
