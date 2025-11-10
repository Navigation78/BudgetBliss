import React, { useState } from 'react';
import { 
  User, Mail, Lock, Settings, Bell, Moon, Sun, LogOut, Camera, Smartphone, 
  CheckCircle, AlertCircle, ChevronDown, ChevronUp, Shield 
} from 'lucide-react';

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {children}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = ({ initialUserData }) => {
  const [userData, setUserData] = useState(initialUserData || {
    username: '',
    email: '',
    profilePicture: null,
    mpesaLinked: false,
    mpesaNumber: ''
  });

  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    savingsGoals: true,
    weeklyReports: false,
    dailyTips: true
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);

  // Profile Picture Upload
  const handleProfilePictureChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUserData(prev => ({ ...prev, profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      console.log('Logging out...');
      // call backend logout or redirect
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMpesaLink = (number) => {
    setUserData(prev => ({ ...prev, mpesaLinked: true, mpesaNumber: number }));
    alert('M-Pesa authorization request sent!');
  };

  const handlePasswordChange = () => {
    alert('Password changed successfully!');
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#04080F] mb-2">Profile & Settings</h1>
          <p className="text-[#3E68A3]">Manage your account and preferences</p>
        </div>

        {/* Profile Picture */}
        <div className="bg-gradient-to-br from-[#E0E9F6] to-[#A1C6EA] rounded-lg p-8 mb-6 text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden mx-auto">
              {userData.profilePicture ? (
                <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#3E68A3]">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-[#3E68A3] hover:bg-[#04080F] text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
              <Camera className="h-5 w-5" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleProfilePictureChange(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
          <h2 className="text-2xl font-bold text-[#04080F] mt-4">{userData.username || 'User'}</h2>
          <p className="text-[#3E68A3]">{userData.email || 'user@example.com'}</p>
        </div>

        {/* M-Pesa */}
        <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#04080F]">M-Pesa Account</h3>
              <p className="text-sm text-gray-600">Link your M-Pesa for automatic transaction tracking</p>
            </div>
          </div>
          {userData.mpesaLinked ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700">Account Connected</span>
                </div>
                <span className="text-sm text-gray-600">{userData.mpesaNumber}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMpesaModal(true)}
                  className="px-4 py-2 bg-white border-2 border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-semibold"
                >
                  Change Number
                </button>
                <button
                  onClick={() => {
                    if (confirm('Unlink M-Pesa account?')) setUserData(prev => ({ ...prev, mpesaLinked: false, mpesaNumber: '' }));
                  }}
                  className="px-4 py-2 bg-white border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold"
                >
                  Unlink Account
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-700">No M-Pesa Account Linked</span>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Link your M-Pesa account to automatically track transactions and get personalized insights.
              </p>
              <button
                onClick={() => setShowMpesaModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Link M-Pesa Account
              </button>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-[#04080F] mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-[#3E68A3]" /> Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Username</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userData.username}
                  onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                  className="flex-1 px-4 py-2 border-2 border-[#E0E9F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E68A3]"
                />
                <button className="px-4 py-2 bg-[#3E68A3] text-white rounded-lg hover:bg-[#04080F] transition-colors font-semibold">Save</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="flex-1 px-4 py-2 border-2 border-[#E0E9F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E68A3]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Password</label>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-[#A1C6EA] text-[#3E68A3] rounded-lg hover:bg-[#E0E9F6] transition-colors font-semibold"
              >
                <Lock className="h-4 w-4" /> Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 mb-6">
          <button
            onClick={() => setSettingsExpanded(prev => !prev)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#3E68A3]" />
              <h3 className="text-lg font-bold text-[#04080F]">Settings & Preferences</h3>
            </div>
            {settingsExpanded ? <ChevronUp className="h-5 w-5 text-[#3E68A3]" /> : <ChevronDown className="h-5 w-5 text-[#3E68A3]" />}
          </button>

          {settingsExpanded && (
            <div className="mt-6 space-y-6">
              {/* Notifications */}
              <div>
                <h4 className="font-semibold text-[#04080F] mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Notification Preferences
                </h4>
                <div className="space-y-3">
                  {Object.keys(notifications).map(key => (
                    <div key={key} className="flex items-center justify-between p-3 bg-[#E0E9F6] rounded-lg">
                      <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <button
                        onClick={() => toggleNotification(key)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[key] ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <h4 className="font-semibold text-[#04080F] mb-3 flex items-center gap-2">
                  {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Theme
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {['light', 'dark'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        theme === t ? 'border-[#3E68A3] bg-[#E0E9F6] text-[#3E68A3]' : 'border-[#E0E9F6] hover:bg-[#E0E9F6]'
                      }`}
                    >
                      {t === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      <span className="font-semibold capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data & Privacy */}
              <div>
                <h4 className="font-semibold text-[#04080F] mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Data & Privacy
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-3 bg-[#E0E9F6] rounded-lg hover:bg-[#A1C6EA] transition-colors text-sm text-gray-700">
                    Download Your Data
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-[#E0E9F6] rounded-lg hover:bg-[#A1C6EA] transition-colors text-sm text-gray-700">
                    Clear Transaction History
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm text-red-600 font-semibold">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>

        {/* Password Modal */}
        <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
          <h3 className="text-xl font-bold text-[#04080F] mb-4">Change Password</h3>
          <div className="space-y-4">
            {['Current Password','New Password','Confirm New Password'].map(label => (
              <div key={label}>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">{label}</label>
                <input type="password" className="w-full px-4 py-2 border-2 border-[#E0E9F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E68A3]" />
              </div>
            ))}
          </div>
          <button
            onClick={handlePasswordChange}
            className="flex-1 mt-4 px-4 py-2 bg-[#3E68A3] text-white rounded-lg hover:bg-[#04080F] transition-colors font-semibold"
          >
            Change Password
          </button>
        </Modal>

        {/* M-Pesa Modal */}
        <Modal isOpen={showMpesaModal} onClose={() => setShowMpesaModal(false)}>
          <h3 className="text-xl font-bold text-[#04080F] mb-4">Link M-Pesa Account</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">M-Pesa Phone Number</label>
              <input
                type="tel"
                placeholder="+254 712 345 678"
                onChange={(e) => setUserData(prev => ({ ...prev, mpesaNumber: e.target.value }))}
                className="w-full px-4 py-2 border-2 border-[#E0E9F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E68A3]"
              />
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> You'll receive an authorization request on your phone. Accept it to allow BudgetBliss to access your transaction data securely via Daraja API.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleMpesaLink(userData.mpesaNumber)}
            className="flex-1 mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Link Account
          </button>
        </Modal>

      </main>
    </div>
  );
};

export default Profile;
