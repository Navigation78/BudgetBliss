import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar"; // Reusable navbar
import LoginPage from "./screens/LoginPage";
import SignupPage from "./screens/SignupPage";
import Home from "./screens/Home";
import Analytics from "./screens/Analytics";
import CreateBudget from "./screens/CreateBudget";
import TipsAndStreaks from "./screens/TipsAndStreaks";
import Profile from "./screens/Profile";
import { getCurrentUser } from "./utils/auth";

// Redirects to login if no user is stored (see src/utils/auth.js). This is a
// stopgap until real Cognito sign-in is wired up.
function RequireAuth({ children }) {
  return getCurrentUser() ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      {/* Navbar appears on every page except login/signup */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected pages */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Navbar />
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/create-budget"
          element={
            <RequireAuth>
              <Navbar />
              <CreateBudget />
            </RequireAuth>
          }
        />
        <Route
          path="/analytics"
          element={
            <RequireAuth>
              <Navbar />
              <Analytics />
            </RequireAuth>
          }
        />
        <Route
          path="/tips"
          element={
            <RequireAuth>
              <Navbar />
              <TipsAndStreaks />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Navbar />
              <Profile />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
