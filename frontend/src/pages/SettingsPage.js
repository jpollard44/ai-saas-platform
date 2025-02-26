import React, { useState } from 'react';
import './SettingsPage.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'AI Engineer and Developer',
    website: 'https://example.com',
    twitter: '@johndoe',
    avatarUrl: 'https://via.placeholder.com/150'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Development Key', key: 'pk_live_XXXXXXXXXXXXXXXX', created: '2023-07-15', lastUsed: '2023-08-20' },
    { id: 2, name: 'Production Key', key: 'pk_test_XXXXXXXXXXXXXXXX', created: '2023-08-01', lastUsed: '2023-08-22' }
  ]);

  const [billingInfo, setBillingInfo] = useState({
    plan: 'Professional',
    nextBilling: '2023-09-15',
    paymentMethod: 'Visa ending in 4242',
    billingHistory: [
      { id: 1, date: '2023-08-15', amount: '$49.99', status: 'Paid', invoice: '#INV-2023-08' },
      { id: 2, date: '2023-07-15', amount: '$49.99', status: 'Paid', invoice: '#INV-2023-07' }
    ]
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    newFeatures: true,
    agentActivity: true,
    billingAlerts: true
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const generateNewApiKey = () => {
    const newKey = {
      id: apiKeys.length + 1,
      name: 'New API Key',
      key: 'pk_live_' + Math.random().toString(36).substring(2, 15),
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const deleteApiKey = (id) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the data to an API
    alert('Profile updated successfully');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // In a real app, this would send the data to an API
    alert('Password updated successfully');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const renderProfileTab = () => (
    <div className="settings-tab-content">
      <h2>Profile Settings</h2>
      <form onSubmit={handleProfileSubmit}>
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <img src={profileData.avatarUrl || 'https://via.placeholder.com/150'} alt="Profile" />
          </div>
          <div className="profile-avatar-controls">
            <button type="button" className="btn btn-secondary">Upload New Image</button>
            <button type="button" className="btn btn-text">Remove</button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name}
            onChange={handleProfileChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email}
            onChange={handleProfileChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={profileData.bio}
            onChange={handleProfileChange}
            className="form-control"
            rows="4"
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={profileData.website}
              onChange={handleProfileChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="twitter">Twitter</label>
            <input
              type="text"
              id="twitter"
              name="twitter"
              value={profileData.twitter}
              onChange={handleProfileChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Changes</button>
          <button type="reset" className="btn btn-secondary">Reset</button>
        </div>
      </form>

      <div className="section-divider"></div>

      <div className="password-section">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderApiKeysTab = () => (
    <div className="settings-tab-content">
      <div className="api-keys-header">
        <h2>API Keys</h2>
        <button className="btn btn-primary" onClick={generateNewApiKey}>Generate New Key</button>
      </div>
      <p className="api-description">
        Use these API keys to authenticate requests with our API. Keep your API keys secure – don't share them in publicly accessible areas or client-side code.
      </p>

      <div className="api-keys-list">
        {apiKeys.map(key => (
          <div key={key.id} className="api-key-item">
            <div className="api-key-info">
              <h3>{key.name}</h3>
              <div className="api-key-value">
                <code>{key.key.substring(0, 10)}•••••••••••••</code>
                <button className="btn-icon" title="Copy API Key">
                  <i className="fas fa-copy"></i>
                </button>
              </div>
              <div className="api-key-meta">
                <span>Created: {key.created}</span>
                <span>Last used: {key.lastUsed}</span>
              </div>
            </div>
            <div className="api-key-actions">
              <button className="btn btn-secondary btn-sm">Rename</button>
              <button 
                className="btn btn-danger btn-sm" 
                onClick={() => deleteApiKey(key.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="settings-tab-content">
      <h2>Billing & Subscription</h2>
      
      <div className="billing-overview">
        <div className="billing-plan-info">
          <h3>Current Plan</h3>
          <div className="plan-card">
            <div className="plan-details">
              <span className="plan-name">{billingInfo.plan}</span>
              <span className="plan-price">$49.99/month</span>
            </div>
            <div className="plan-features">
              <ul>
                <li>Unlimited AI agents</li>
                <li>1,000,000 API calls per month</li>
                <li>Custom branding</li>
                <li>Premium support</li>
              </ul>
            </div>
            <div className="next-billing">
              Next billing date: <strong>{billingInfo.nextBilling}</strong>
            </div>
          </div>
          <div className="plan-actions">
            <button className="btn btn-secondary">Change Plan</button>
            <button className="btn btn-danger btn-outline">Cancel Subscription</button>
          </div>
        </div>

        <div className="payment-method">
          <h3>Payment Method</h3>
          <div className="payment-card">
            <div className="card-info">
              <i className="far fa-credit-card"></i>
              <span>{billingInfo.paymentMethod}</span>
            </div>
            <button className="btn btn-text">Change</button>
          </div>
        </div>
      </div>

      <div className="billing-history">
        <h3>Billing History</h3>
        <table className="billing-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {billingInfo.billingHistory.map(item => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.amount}</td>
                <td>
                  <span className="status-badge status-paid">{item.status}</span>
                </td>
                <td>
                  <a href="#" className="invoice-link">{item.invoice}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-tab-content">
      <h2>Notification Settings</h2>
      <p className="notification-description">
        Manage how and when you receive notifications from our platform.
      </p>

      <div className="notification-options">
        <div className="notification-option">
          <div className="notification-info">
            <h3>Email Notifications</h3>
            <p>Receive important alerts and updates via email</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              name="emailNotifications" 
              checked={notificationSettings.emailNotifications} 
              onChange={handleNotificationChange}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="notification-option">
          <div className="notification-info">
            <h3>Marketing Communications</h3>
            <p>Receive promotional offers and updates</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              name="marketingEmails" 
              checked={notificationSettings.marketingEmails} 
              onChange={handleNotificationChange}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="notification-option">
          <div className="notification-info">
            <h3>New Features & Updates</h3>
            <p>Get notified about platform improvements and new capabilities</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              name="newFeatures" 
              checked={notificationSettings.newFeatures} 
              onChange={handleNotificationChange}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="notification-option">
          <div className="notification-info">
            <h3>Agent Activity</h3>
            <p>Receive updates about your AI agents' activities and performance</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              name="agentActivity" 
              checked={notificationSettings.agentActivity} 
              onChange={handleNotificationChange}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="notification-option">
          <div className="notification-info">
            <h3>Billing Alerts</h3>
            <p>Get notified about upcoming charges and billing updates</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              name="billingAlerts" 
              checked={notificationSettings.billingAlerts} 
              onChange={handleNotificationChange}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary">Save Preferences</button>
        <button className="btn btn-secondary">Reset to Default</button>
      </div>
    </div>
  );

  return (
    <div className="settings-page-container">
      <h1>Account Settings</h1>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <ul className="settings-nav">
            <li 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user"></i>
              Profile
            </li>
            <li 
              className={activeTab === 'api-keys' ? 'active' : ''}
              onClick={() => setActiveTab('api-keys')}
            >
              <i className="fas fa-key"></i>
              API Keys
            </li>
            <li 
              className={activeTab === 'billing' ? 'active' : ''}
              onClick={() => setActiveTab('billing')}
            >
              <i className="fas fa-credit-card"></i>
              Billing & Subscription
            </li>
            <li 
              className={activeTab === 'notifications' ? 'active' : ''}
              onClick={() => setActiveTab('notifications')}
            >
              <i className="fas fa-bell"></i>
              Notifications
            </li>
          </ul>
        </div>
        
        <div className="settings-main">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'api-keys' && renderApiKeysTab()}
          {activeTab === 'billing' && renderBillingTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
