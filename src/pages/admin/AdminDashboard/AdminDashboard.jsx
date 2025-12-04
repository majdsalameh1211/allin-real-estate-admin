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
      // 1. Try to load from LocalStorage first (for speed)
      const stored = getCurrentAdmin();
      if (stored) setAdmin(stored);

      // 2. Fetch fresh data from server (to get new images/links)
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

  if (loading) return <div className="profile-loading"><div className="spinner"></div></div>;
  if (!admin) return <div className="profile-error">Please login again.</div>;

  const worker = admin.workerProfile;
  const hasWorker = !!worker;
  const workerName = hasWorker ? (worker.translations?.en?.name || 'Unnamed Profile') : 'No Profile Linked';
  const joinDate = new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const adminInitials = `${admin.firstName[0]}${admin.lastName[0]}`;
  // Check for linked worker image
  const profileImage = admin.workerProfile?.image;


  return (
    <div className="profile-wrapper fade-in">

      <div className="main-profile-card">

        {/* --- LEFT COLUMN (Identity) --- */}
        <div className="profile-header-section">
          <div className="admin-avatar-large">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="admin-avatar-image"
              />
            ) : (
              adminInitials
            )}
          </div>
          <h1 className="profile-name">{admin.firstName} {admin.lastName}</h1>
          <div className="profile-badges">
            <span className="role-pill">{admin.role}</span>
            <span className="status-pill online">Online</span>
          </div>
        </div>

        {/* --- RIGHT COLUMN (Details & Actions) --- */}
        <div className="profile-content-right">

          <div className="profile-details-grid">
            <div className="detail-item">
              <div className="detail-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div className="detail-content">
                <label>System ID</label>
                <p className="mono-font">{admin.id || admin._id}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div className="detail-content">
                <label>Email Address</label>
                <p>{admin.email}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div className="detail-content">
                <label>Member Since</label>
                <p>{joinDate}</p>
              </div>
            </div>

            {/* Empty spacer for grid alignment on desktop if needed */}
            <div className="detail-item desktop-only-spacer"></div>
          </div>

          <div className="section-divider"></div>

          {/* WORKER ACTION ROW */}
          <div
            className={`worker-action-row ${hasWorker ? 'clickable' : 'disabled'}`}
            onClick={() => hasWorker && setShowWorkerModal(true)}
          >
            <div className="worker-row-left">
              <div className={`worker-icon-circle ${hasWorker ? 'active' : ''}`}>
                {hasWorker && worker.image ? (
                  <img
                    src={worker.image}
                    alt="Worker"
                    className="worker-small-image"
                  />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                )}
              </div>
              <div className="worker-row-info">
                <span className="worker-label">Public Profile Link</span>
                <span className="worker-value">{workerName}</span>
              </div>
            </div>

            {hasWorker ? (
              <div className="worker-arrow">
                <span className="view-text">View Details</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            ) : (
              <div className="worker-status">Not Linked</div>
            )}
          </div>
        </div>
      </div>

      {/* WORKER DETAILS MODAL - Same as before */}
      {showWorkerModal && worker && (
        <div className="modal-overlay" onClick={() => setShowWorkerModal(false)}>
          <div className="modal-card fade-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Public Profile Details</h3>
              <button className="close-btn" onClick={() => setShowWorkerModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="worker-summary">
                {worker.image ? (
                  <img src={worker.image} alt="Profile" className="worker-modal-avatar" />
                ) : (
                  <div className="worker-modal-placeholder">{workerName[0]}</div>
                )}
                <div>
                  <h4>{workerName}</h4>
                  <p>{worker.translations?.en?.title || 'Team Member'}</p>
                  <span className={`status-badge ${worker.active ? 'active' : 'inactive'}`}>
                    {worker.active ? 'Visible Publicly' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="worker-stats-grid">
                <div className="w-stat"><strong>{worker.stats?.yearsExperience || 0}</strong><span>Years</span></div>
                <div className="w-stat"><strong>{worker.stats?.projectsCompleted || 0}</strong><span>Sold</span></div>
                <div className="w-stat"><strong>{worker.stats?.clientsSatisfied || 0}</strong><span>Clients</span></div>
              </div>
              <div className="worker-info-block">
                <label>License</label>
                <p>{worker.licenseNumber || 'N/A'}</p>
              </div>
              <div className="worker-info-block">
                <label>Contact</label>
                <div className="contact-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  {worker.email}
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