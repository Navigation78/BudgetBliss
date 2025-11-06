import React, { useState } from "react";
import { Sun, Moon, Bell, Settings, LogOut, UploadCloud } from "lucide-react";

const Profile = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [mpesaNumber, setMpesaNumber] = useState("");

  const toggleSettings = () => setShowSettings(prev => !prev);
  const toggleTheme = () => setDarkMode(prev => !prev);

  const handleProfilePic = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="min-h-screen p-6 bg-softBlue">
      <h1 className="text-3xl font-bold text-royalBlue mb-6">Profile</h1>

      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mr-4">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <UploadCloud size={32} />
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleProfilePic} className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <p className="font-semibold text-gray-700">Username</p>
          <p className="text-gray-600">JuliaMigwi</p>
        </div>
        <div className="mb-4">
          <p className="font-semibold text-gray-700">Email</p>
          <p className="text-gray-600">julia@example.com</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Change Password
        </button>
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={toggleSettings}
        >
          <h2 className="text-xl font-semibold text-gray-700">Settings</h2>
          <Settings className="text-gray-500" />
        </div>
        {showSettings && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-700 flex items-center"><Bell className="mr-2" /> Notifications</p>
              <button className="bg-gray-200 px-3 py-1 rounded">Edit</button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-700 flex items-center">
                {darkMode ? <Moon className="mr-2" /> : <Sun className="mr-2" />} Theme
              </p>
              <button
                onClick={toggleTheme}
                className={`px-3 py-1 rounded ${darkMode ? "bg-gray-800 text-white" : "bg-gray-200"}`}
              >
                {darkMode ? "Dark" : "Light"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Management */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Management</h2>
        <div className="flex flex-col space-y-3">
          <label className="text-gray-700 font-medium">Link M-Pesa Number</label>
          <input
            type="text"
            placeholder="Enter M-Pesa number"
            value={mpesaNumber}
            onChange={(e) => setMpesaNumber(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            Save
          </button>
        </div>
      </div>

      {/* Logout */}
      <button className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
        <LogOut className="mr-2" /> Logout
      </button>
    </div>
  );
};

export default Profile;
