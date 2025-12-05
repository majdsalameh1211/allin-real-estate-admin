// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { getCurrentAdmin, getMe } from '../../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWorkerModal, setShowWorkerModal] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      const stored = getCurrentAdmin();
      if (stored) setAdmin(stored);

      try {
        const freshData = await getMe();
        setAdmin(freshData);
      } catch (error) {
        console.error("Failed to refresh profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="luxury-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="profile-error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>Please login again</p>
      </div>
    );
  }

  const worker = admin.workerProfile;
  const hasWorker = !!worker;
  const workerName = hasWorker ? (worker.translations?.en?.name || 'Unnamed Profile') : 'No Profile Linked';
  const joinDate = new Date(admin.createdAt).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric' 
  });
  const adminInitials = `${admin.firstName[0]}${admin.lastName[0]}`;
  const profileImage = admin.workerProfile?.image;

  return (
    <div className="dashboard-container">
      
      {/* Decorative Background Elements */}
      <div className="bg-decoration"></div>
      
      <div className="dashboard-content">
        
        {/* Main Profile Card */}
        <div className="profile-card-luxury">
          
          {/* Top Section - Avatar & Identity */}
          <div className="profile-top-section">
            <div className="avatar-container">
              <div className="avatar-ring"></div>
              <div className="avatar-main">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="avatar-image" />
                ) : (
                  <span className="avatar-initials">{adminInitials}</span>
                )}
              </div>
              <div className="status-indicator">
                <span className="status-dot"></span>
              </div>
            </div>
            
            <div className="identity-section">
              <h1 className="profile-name-luxury">
                {admin.firstName} {admin.lastName}
              </h1>
              <div className="role-badges">
                <span className="badge-luxury role">{admin.role}</span>
                <span className="badge-luxury status">Active</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{joinDate}</span>
              </div>
            </div>

            <div className="stat-divider"></div>

            <div className="stat-item">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Profile Status</span>
                <span className="stat-value">{hasWorker ? 'Linked' : 'Not Linked'}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="info-grid-luxury">
            <div className="info-card">
              <div className="info-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="info-details">
                <span className="info-label">System ID</span>
                <span className="info-value mono">{admin.id || admin._id}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="info-details">
                <span className="info-label">Email Address</span>
                <span className="info-value">{admin.email}</span>
              </div>
            </div>
          </div>

          {/* Public Profile Section - Enhanced */}
          <div className="public-profile-luxury">
            <div className="public-profile-header">
              <div className="profile-icon-luxury">
                {hasWorker && worker.image ? (
                  <img src={worker.image} alt="Worker" className="profile-icon-image" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                )}
              </div>
              <div className="profile-text-luxury">
                <span className="profile-subtitle">Public Profile</span>
                <span className="profile-title">{workerName}</span>
              </div>
            </div>
            
            <button 
              className={`view-profile-btn ${!hasWorker ? 'disabled' : ''}`}
              onClick={() => hasWorker && setShowWorkerModal(true)}
              disabled={!hasWorker}
            >
              <span>{hasWorker ? 'View Full Details' : 'Not Available'}</span>
              {hasWorker && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Enhanced Modal */}
      {showWorkerModal && worker && (
        <div className="modal-overlay-luxury" onClick={() => setShowWorkerModal(false)}>
          <div className="modal-card-luxury" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="modal-header-luxury">
              <div className="modal-title-section">
                <h3>Public Profile Details</h3>
                <span className="modal-subtitle">Complete information</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowWorkerModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body-luxury">
              
              {/* Profile Summary */}
              <div className="modal-profile-summary">
                <div className="modal-avatar">
                  {worker.image ? (
                    <img src={worker.image} alt="Profile" />
                  ) : (
                    <span className="modal-avatar-placeholder">{workerName[0]}</span>
                  )}
                </div>
                <div className="modal-profile-info">
                  <h4>{workerName}</h4>
                  <p>{worker.translations?.en?.title || 'Team Member'}</p>
                  <span className={`modal-status-badge ${worker.active ? 'active' : 'inactive'}`}>
                    {worker.active ? '● Visible Publicly' : '● Hidden'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="modal-stats-grid">
                <div className="modal-stat">
                  <span className="modal-stat-number">{worker.stats?.yearsExperience || 0}</span>
                  <span className="modal-stat-label">Years Experience</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-number">{worker.stats?.projectsCompleted || 0}</span>
                  <span className="modal-stat-label">Properties Sold</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-number">{worker.stats?.clientsSatisfied || 0}</span>
                  <span className="modal-stat-label">Happy Clients</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="modal-info-section">
                <div className="modal-info-item">
                  <span className="modal-info-label">License Number</span>
                  <span className="modal-info-value">{worker.licenseNumber || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Contact Email</span>
                  <span className="modal-info-value">{worker.email}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;