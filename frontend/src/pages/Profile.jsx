import React, { useState, useEffect } from 'react';
import { apiService } from '../assets/api';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { isDarkMode, colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [originalData, setOriginalData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCurrentUser();
      if (response.success) {
        const userData = { name: response.user.name, email: response.user.email };
        setProfileData(userData);
        setOriginalData(userData);
      }
    } catch (err) {
      toast.error('Failed to load profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileData.name === originalData.name && profileData.email === originalData.email) {
      toast('No changes to save', { icon: 'ℹ️' });
      return;
    }
    try {
      setSaving(true);
      const response = await apiService.updateProfile(profileData);
      if (response.success) {
        const updated = { name: response.user.name, email: response.user.email };
        setOriginalData(updated);
        setProfileData(updated);
        // Update localStorage so navbar reflects changes
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, ...updated }));
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      setChangingPassword(true);
      const response = await apiService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const hasChanges = profileData.name !== originalData.name || profileData.email !== originalData.email;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-400 border-t-teal-600"></div>
          <p className={`mt-6 text-xl ${theme.text} font-medium`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-3xl p-8 border ${theme.border} shadow-2xl text-center`}>
        <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-black ${isDarkMode ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' : 'bg-gradient-to-br from-teal-400 to-cyan-400 text-white'} shadow-lg`}>
          {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <h1 className={`text-3xl font-black ${theme.text}`}>{profileData.name}</h1>
        <p className={`${theme.textSecondary} mt-1`}>{profileData.email}</p>
        <p className={`text-xs ${theme.textMuted} mt-2`}>Member since {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Profile Form */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-8 border ${theme.border} shadow-2xl`}>
        <h2 className={`text-xl font-bold ${theme.text} mb-6 flex items-center gap-2`}>
          <span className="text-2xl">👤</span> Edit Profile
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div>
            <label className={`block ${theme.text} font-semibold mb-2 text-sm`}>Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className={`w-full ${theme.input} border ${theme.border} rounded-xl px-4 py-3 focus:outline-none ${theme.inputFocus} transition-all`}
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className={`block ${theme.text} font-semibold mb-2 text-sm`}>Email Address</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className={`w-full ${theme.input} border ${theme.border} rounded-xl px-4 py-3 focus:outline-none ${theme.inputFocus} transition-all`}
              placeholder="your@email.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving || !hasChanges}
            className={`w-full py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg ${
              hasChanges
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white hover:shadow-2xl'
                : `${isDarkMode ? 'bg-white/10 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
            }`}
          >
            {saving ? '⏳ Saving...' : hasChanges ? '✓ Save Changes' : 'No Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-8 border ${theme.border} shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${theme.text} flex items-center gap-2`}>
            <span className="text-2xl">🔒</span> Security
          </h2>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className={`px-4 py-2 ${theme.buttonSecondary} rounded-lg transition-all font-medium text-sm ${theme.text}`}
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className={`block ${theme.text} font-semibold mb-2 text-sm`}>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className={`w-full ${theme.input} border ${theme.border} rounded-xl px-4 py-3 focus:outline-none ${theme.inputFocus} transition-all`}
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className={`block ${theme.text} font-semibold mb-2 text-sm`}>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={`w-full ${theme.input} border ${theme.border} rounded-xl px-4 py-3 focus:outline-none ${theme.inputFocus} transition-all`}
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className={`block ${theme.text} font-semibold mb-2 text-sm`}>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={`w-full ${theme.input} border ${theme.border} rounded-xl px-4 py-3 focus:outline-none ${theme.inputFocus} transition-all`}
                placeholder="Repeat new password"
                required
                minLength={8}
              />
              {passwordData.newPassword && passwordData.confirmPassword && (
                <p className={`text-xs mt-2 font-medium ${passwordData.newPassword === passwordData.confirmPassword ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                  {passwordData.newPassword === passwordData.confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-2xl"
            >
              {changingPassword ? '⏳ Changing...' : '🔐 Update Password'}
            </button>
          </form>
        ) : (
          <div className={`${isDarkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl p-4`}>
            <p className={`${theme.textSecondary} text-sm`}>
              Your password was last updated recently. Click "Change Password" to update it.
            </p>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-red-500/10 border-red-400/30' : 'bg-red-50 border-red-200'} rounded-2xl p-6 border shadow-lg`}>
        <h2 className={`text-lg font-bold ${theme.error} mb-2 flex items-center gap-2`}>
          <span>⚠️</span> Account Information
        </h2>
        <p className={`${theme.textSecondary} text-sm`}>
          Your data is securely stored and encrypted. Contact support if you need to delete your account.
        </p>
      </div>
    </div>
  );
};

export default Profile;
