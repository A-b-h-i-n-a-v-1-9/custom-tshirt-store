import React, { useState, useEffect } from 'react';
import '../styles/profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: ''
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/profile/?userId=1');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        setUserData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg', // You can update this if the API provides an avatar.
          joinDate: 'Joined March 2022', // If the API provides this info, update accordingly.
          address: {
            street: data.address.street,
            city: data.address.city,
            state: data.address.state,
            zip_code: data.address.zip_code,
            country: data.address.country
          }
        });
  
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
  
    fetchUserData();
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setUserData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Profile updated:', userData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="profile-container">
      {/* Profile Header with Avatar */}
      <div className="profile-header">
        <div className="avatar-container">
          <img src={userData.avatar} alt="Profile" className="profile-avatar" />
          <div className="avatar-overlay">
            <span className="edit-avatar-icon">✎</span>
          </div>
        </div>
        <div className="profile-meta">
          <h1>{userData.name}</h1>
          <p className="profile-email">{userData.email}</p>
          <p className="profile-join-date">{userData.joinDate}</p>
        </div>
        {!isEditing && (
          <button 
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button 
            className={`tab-button ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            Address
          </button>
          <button 
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            {activeTab === 'personal' && (
              <div className="form-section">
                <h2>
                  <span className="form-icon">👤</span>
                  Personal Information
                </h2>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="form-section">
                <h2>
                  <span className="form-icon">🏠</span>
                  Address Information
                </h2>
                <div className="form-group">
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    value={userData.address.street}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="address.city"
                      value={userData.address.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      name="address.state"
                      value={userData.address.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zip_code">ZIP/Postal Code</label>
                    <input
                      type="text"
                      id="zip_code"
                      name="address.zip_code"
                      value={userData.address.zip_code}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="address.country"
                      value={userData.address.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="form-section">
                <h2>
                  <span className="form-icon">🔒</span>
                  Security Settings
                </h2>
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    type="password"
                    id="current-password"
                    name="currentPassword"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    name="newPassword"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            {activeTab === 'personal' && (
              <div className="profile-section">
                <h2>
                  <span className="section-icon">👤</span>
                  Personal Information
                </h2>
                <div className="info-grid">
                  <div className="info-card">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{userData.name}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Email</span>
                    <span className="info-value">{userData.email}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{userData.phone}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">{userData.joinDate}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="profile-section">
                <h2>
                  <span className="section-icon">🏠</span>
                  Address Information
                </h2>
                <div className="info-grid">
                  <div className="info-card">
                    <span className="info-label">Street</span>
                    <span className="info-value">{userData.address.street}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">City</span>
                    <span className="info-value">{userData.address.city}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">State</span>
                    <span className="info-value">{userData.address.state}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">ZIP Code</span>
                    <span className="info-value">{userData.address.zip_code}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Country</span>
                    <span className="info-value">{userData.address.country}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="profile-section">
                <h2>
                  <span className="section-icon">🔒</span>
                  Security Settings
                </h2>
                <div className="security-actions">
                  <button className="security-button">
                    Change Password
                  </button>
                  <button className="security-button">
                    Two-Factor Authentication
                  </button>
                  <button className="security-button">
                    Connected Devices
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;