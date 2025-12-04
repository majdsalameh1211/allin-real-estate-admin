// src/pages/admin/AdminForm/AdminForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getAdminUser,
  createAdminUser,
  updateAdminUser,
  getAllTeamMembers
} from '../../../services/api';
import './AdminForm.css';

const AdminForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'admin',
    password: '',
    confirmPassword: '',
    workerProfile: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [errors, setErrors] = useState({});
  const [teamMembers, setTeamMembers] = useState([]); // 🆕 Add this
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false); // 🆕 Add thi

  useEffect(() => {
    fetchTeamMembers(); // 🆕 Add this
    if (isEditMode) {
      fetchAdminData();
    }
  }, [id]);

  const fetchTeamMembers = async () => {
    try {
      setLoadingTeamMembers(true);
      const data = await getAllTeamMembers();
      setTeamMembers(data);
    } catch (error) {
      console.error('Failed to load team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      setFetchingData(true);
      const data = await getAdminUser(id);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        role: data.role || 'admin',
        password: '',
        confirmPassword: '',
        workerProfile: data.workerProfile?._id || '' // 🆕 Add this
      });
    } catch (error) {
      toast.error(error.message);
      navigate('/admin/users');
    } finally {
      setFetchingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!isEditMode || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        workerProfile: formData.workerProfile || null
      };

      if (formData.password) {
        dataToSend.password = formData.password;
      }

      if (isEditMode) {
        await updateAdminUser(id, dataToSend);
        toast.success('Admin user updated successfully');
      } else {
        await createAdminUser(dataToSend);
        toast.success('Admin user created successfully');
      }

      navigate('/admin/users');
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} admin user`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="admin-form-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-form-container">
      <button className="back-button" onClick={() => navigate('/admin/users')}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
        </svg>
        Back to Admins
      </button>

      <div className="form-page-header">
        <h1>{isEditMode ? 'Edit Admin User' : 'Add New Admin'}</h1>
        <p className="form-subtitle">
          {isEditMode
            ? 'Update administrator information and permissions'
            : 'Create a new administrator account'
          }
        </p>
      </div>

      <div className="admin-form-card">
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Personal Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="admin@example.com"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="+972 50-123-4567"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>
          </div>

          {/* 🆕 ADD THIS ENTIRE SECTION */}
          <div className="form-section">
            <h3>Worker Profile (Optional)</h3>

            {isEditMode && formData.workerProfile && teamMembers.length > 0 && (
              <div className="current-worker-info">
                {(() => {
                  const currentWorker = teamMembers.find(w => (w.id || w._id) === formData.workerProfile);
                  if (currentWorker) {
                    const workerName = currentWorker.name || currentWorker.translations?.en?.name || 'Unnamed';
                    const workerTitle = currentWorker.title || currentWorker.translations?.en?.title || 'Team Member';
                    return (
                      <div className="worker-display-card">
                        {currentWorker.image && (
                          <img
                            src={currentWorker.image}
                            alt={workerName}
                            className="worker-avatar"
                          />
                        )}
                        <div className="worker-info">
                          <div className="worker-name">{workerName}</div>
                          <div className="worker-title">{workerTitle}</div>
                          <div className="worker-license">License: {currentWorker.licenseNumber || 'N/A'}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            <div className="form-group">
              <label>Attach to Worker Profile</label>
              <select
                name="workerProfile"
                value={formData.workerProfile}
                onChange={handleChange}
                disabled={loadingTeamMembers}
              >
                <option value="">-- No Worker Profile --</option>
                {teamMembers.map((member) => {
                  const memberId = member.id || member._id;
                  const memberName = member.name || member.translations?.en?.name || 'Unnamed';
                  return (
                    <option key={memberId} value={memberId}>
                      {memberName} - {member.licenseNumber || 'No License'}
                    </option>
                  );
                })}
              </select>
              <p className="field-hint">
                Link this admin account to a public worker profile. Leave blank for monitoring-only admins.
              </p>
            </div>
          </div>

          <div className="form-section">
            <h3>Account Settings</h3>

            <div className="form-group">
              <label>
                Role <span className="required">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
              <p className="field-hint">
                Super Admins can manage other admin accounts
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Password {!isEditMode && <span className="required">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder={isEditMode ? 'Leave blank to keep current password' : 'Enter password'}
                  autoComplete={isEditMode ? 'current-password' : 'new-password'}
                />

                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
                {isEditMode && (
                  <p className="field-hint">
                    Leave blank to keep the current password
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Confirm Password {!isEditMode && <span className="required">*</span>}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder={isEditMode ? 'Confirm new password' : 'Re-enter password'}
                  autoComplete="new-password"
                />

                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/admin/users')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  {isEditMode ? 'Update Admin' : 'Create Admin'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;