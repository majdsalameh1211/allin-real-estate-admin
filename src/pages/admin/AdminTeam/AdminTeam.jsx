// src/pages/admin/AdminTeam/AdminTeam.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import './AdminTeam.css';

const AdminTeam = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/team/admin/all?lang=en');
      // Backend returns array directly (not wrapped in data)
      const members = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setTeamMembers(members);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load team members');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/team/${deleteModal.id}`);
      toast.success('Team member and profile image deleted successfully');
      setDeleteModal({ show: false, id: null, name: '' });
      fetchTeamMembers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete team member');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleBadgeClass = (role) => {
    const roleMap = {
      'Founder': 'badge-founder',
      'Partner': 'badge-partner',
      'Agent': 'badge-agent',
      'Consultant': 'badge-consultant',
      'Manager': 'badge-manager',
      'Other': 'badge-other'
    };
    return roleMap[role] || 'badge-other';
  };

  // Helper to get member name (handles both formats)
  const getMemberName = (member) => {
    return member.name || member.translations?.en?.name || 'Unknown';
  };

  // Helper to get member title (handles both formats)
  const getMemberTitle = (member) => {
    return member.title || member.translations?.en?.title || '';
  };

  // Helper to get member ID
  const getMemberId = (member) => {
    return member.id || member._id;
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1>Team Members</h1>
          <p>Manage your real estate team</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/admin/team/new')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          Add Team Member
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="admin-table-container desktop-only">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Phone</th>
              <th>License #</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-state-content">
                    <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <p>No team members yet</p>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/admin/team/new')}
                    >
                      Add First Team Member
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              teamMembers.map((member) => (
                <tr key={getMemberId(member)}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {member.image && !member.image.includes('placeholder') ? (
                          <img src={member.image} alt={getMemberName(member)} />
                        ) : (
                          <span>{getInitials(getMemberName(member))}</span>
                        )}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{getMemberName(member)}</div>
                        <div className="user-title">{getMemberTitle(member)}</div>
                      </div>
                    </div>
                  </td>
                  <td>{member.email}</td>
                  <td>{member.phoneNumber || '—'}</td>
                  <td>
                    <code className="license-number">{member.licenseNumber}</code>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${member.active ? 'status-active' : 'status-inactive'}`}>
                      {member.active ? 'Active' : 'Inactive'}
                    </span>
                    {member.featured && (
                      <span className="featured-badge">⭐ Featured</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => navigate(`/admin/team/edit/${getMemberId(member)}`)}
                        title="Edit"
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => setDeleteModal({ 
                          show: true, 
                          id: getMemberId(member), 
                          name: getMemberName(member) 
                        })}
                        title="Delete"
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="cards-grid mobile-only">
        {teamMembers.length === 0 ? (
          <div className="empty-state-card">
            <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <p>No team members yet</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/admin/team/new')}
            >
              Add First Team Member
            </button>
          </div>
        ) : (
          teamMembers.map((member) => (
            <div key={getMemberId(member)} className="team-card">
              <div className="card-header">
                <div className="user-avatar-large">
                  {member.image && !member.image.includes('placeholder') ? (
                    <img src={member.image} alt={getMemberName(member)} />
                  ) : (
                    <span>{getInitials(getMemberName(member))}</span>
                  )}
                </div>
                <div className="card-header-info">
                  <h3>{getMemberName(member)}</h3>
                  <p className="member-title">{getMemberTitle(member)}</p>
                  <span className={`badge ${getRoleBadgeClass(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="info-item">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>{member.email}</span>
                </div>

                {member.phoneNumber && (
                  <div className="info-item">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>{member.phoneNumber}</span>
                  </div>
                )}

                <div className="info-item">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                  <code className="license-number">{member.licenseNumber}</code>
                </div>

                <div className="card-badges">
                  <span className={`status-badge ${member.active ? 'status-active' : 'status-inactive'}`}>
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                  {member.featured && (
                    <span className="featured-badge">⭐ Featured</span>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/admin/team/edit/${getMemberId(member)}`)}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => setDeleteModal({ 
                    show: true, 
                    id: getMemberId(member), 
                    name: getMemberName(member) 
                  })}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteModal({ show: false, id: null, name: '' })}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Team Member</h2>
              <button 
                className="modal-close"
                onClick={() => !deleting && setDeleteModal({ show: false, id: null, name: '' })}
                disabled={deleting}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-icon">
                <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                </svg>
              </div>
              <p>Are you sure you want to delete <strong>{deleteModal.name}</strong>?</p>
              <p className="warning-text">This will also permanently delete their profile image from storage. This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Team Member'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;