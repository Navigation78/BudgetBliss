import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Reusable navbar
import LoginPage from "./screens/LoginPage";
import SignupPage from "./screens/SignupPage";
import Home from "./screens/Home";
import Analytics from "./screens/Analytics";
import CreateBudget from "./screens/CreateBudget";
import TipsAndStreaks from "./screens/TipsAndStreaks";
import Profile from "./screens/Profile";

function App() {
  return (
    <Router>
      {/* Navbar appears on every page except login/signup */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected pages (mock for now) */}
        <Route
          path="/home"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />
        <Route
          path="/create-budget"
          element={
            <>
              <Navbar />
              <CreateBudget />
            </>
          }
        />
        <Route
          path="/analytics"
          element={
            <>
              <Navbar />
              <Analytics />
            </>
          }
        />
        <Route
          path="/tips"
          element={
            <>
              <Navbar />
              <TipsAndStreaks />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <Navbar />
              <Profile />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
