// src/pages/admin/AdminManagement/AdminManagement.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getAdminUsers,
  deleteAdminUser,
  getCurrentAdmin
} from '../../../services/api';
import './AdminManagement.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    loadCurrentAdmin();
  }, []);

  const loadCurrentAdmin = () => {
    const admin = getCurrentAdmin();
    setCurrentAdmin(admin);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteAdminUser(userId);
      toast.success('Admin user deleted successfully');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete admin user');
    }
  };

  const getRoleBadgeClass = (role) => {
    return role === 'superadmin' ? 'badge badge-superadmin' : 'badge badge-admin';
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // ✅ NEW HELPER
  const renderAvatar = (user) => {
    if (user.workerProfile?.image) {
      return (
        <img
          src={user.workerProfile.image}
          alt={user.firstName}
          className="avatar-image"
        />
      );
    }
    return getInitials(user.firstName, user.lastName);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Manage Admins</h1>
          <p>Manage administrator accounts and permissions</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/admin/users/new')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Add Admin
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading admin users...</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">
          <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <h3>No Admin Users Yet</h3>
          <p>Get started by creating your first admin user</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-table-container desktop-only">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-name">
                        <div className="user-avatar">
                          {renderAvatar(user)}
                        </div>
                        <div>
                          <div className="name-primary">
                            {user.firstName} {user.lastName}
                          </div>
                          {currentAdmin?.id === user._id && (
                            <span className="current-user-badge">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || '—'}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role === 'superadmin' ? '⭐ Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        {currentAdmin?.id !== user._id && (
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => setDeleteConfirm(user)}
                            title="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="cards-grid mobile-only">
            {users.map((user) => (
              <div key={user._id} className="admin-card">
                <div className="card-header">
                  <div className="card-avatar-large">
                    {renderAvatar(user)}
                  </div>
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role === 'superadmin' ? '⭐ Super Admin' : 'Admin'}
                  </span>
                </div>

                <div className="card-content">
                  <div className="card-title">
                    {user.firstName} {user.lastName}
                    {currentAdmin?.id === user._id && (
                      <span className="current-user-badge" style={{ marginLeft: '0.5rem' }}>You</span>
                    )}
                  </div>

                  <div className="card-info">
                    <div className="card-info-item">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {user.email}
                    </div>

                    {user.phoneNumber && (
                      <div className="card-info-item">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {user.phoneNumber}
                      </div>
                    )}

                    <div className="card-info-item">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                      </svg>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-card-action btn-edit"
                    onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  {currentAdmin?.id !== user._id && (
                    <button
                      className="btn-card-action btn-delete"
                      onClick={() => setDeleteConfirm(user)}
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Admin User</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="warning-icon">
                <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                </svg>
              </div>
              <p>
                Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>?
              </p>
              <p className="warning-text">
                This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>
                Delete Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;