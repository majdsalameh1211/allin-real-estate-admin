// src/pages/admin/TeamMemberForm/TeamMemberForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { createTeamMember, updateTeamMember } from '../../../services/api';
import './TeamMemberForm.css';

const TeamMemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState('en');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // File upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const defaultFormData = {
    translations: {
      en: { name: '', title: '', quote: '', bio: '', specialties: [] },
      ar: { name: '', title: '', quote: '', bio: '', specialties: [] },
      he: { name: '', title: '', quote: '', bio: '', specialties: [] }
    },
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseType: 'Real Estate Agent',
    image: '',
    order: 0,
    role: 'Agent',
    featured: false,
    active: true,
    socialMedia: {
      linkedin: '',
      facebook: '',
      instagram: '',
      twitter: ''
    },
    stats: {
      yearsExperience: 0,
      projectsCompleted: 0,
      clientsSatisfied: 0
    }
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchTeamMemberData();
    }
  }, [id]);

  const fetchTeamMemberData = async () => {
    try {
      setFetchingData(true);
      const response = await api.get(`/team/admin/${id}`);
      // Backend returns member directly in response.data
      const data = response.data;
      setFormData(data);

      // Set existing image as preview
      if (data.image) {
        setImagePreview(data.image);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load team member');
      navigate('/admin/team');
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (lang, field, value) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    }));
  };

  const handleSpecialtyChange = (lang, index, value) => {
    const newSpecialties = [...formData.translations[lang].specialties];
    newSpecialties[index] = value;
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          specialties: newSpecialties
        }
      }
    }));
  };

  const handleAddSpecialty = (lang) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          specialties: [...prev.translations[lang].specialties, '']
        }
      }
    }));
  };

  const handleRemoveSpecialty = (lang, index) => {
    const newSpecialties = formData.translations[lang].specialties.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          specialties: newSpecialties
        }
      }
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be smaller than 10MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      const fakeEvent = { target: { files: [imageFile] } };
      handleFileSelect(fakeEvent);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all languages have name, title, bio
    const languages = ['en', 'ar', 'he'];
    for (const lang of languages) {
      if (!formData.translations[lang].name.trim()) {
        newErrors[`name_${lang}`] = `Name is required in ${lang.toUpperCase()}`;
      }
      if (!formData.translations[lang].title.trim()) {
        newErrors[`title_${lang}`] = `Title is required in ${lang.toUpperCase()}`;
      }
      if (!formData.translations[lang].bio.trim()) {
        newErrors[`bio_${lang}`] = `Bio is required in ${lang.toUpperCase()}`;
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);

      // Build FormData for file upload
      const data = new FormData();

      // Add image file if exists
      if (imageFile) {
        data.append('imageFile', imageFile);
      }

      // Add image URL if no file (for URL-based images)
      if (!imageFile && formData.image) {
        data.append('image', formData.image);
      }

      // Add other fields
      data.append('translations', JSON.stringify(formData.translations));
      data.append('email', formData.email);
      data.append('phoneNumber', formData.phoneNumber || '');
      data.append('licenseNumber', formData.licenseNumber);
      data.append('licenseType', formData.licenseType);
      data.append('order', formData.order.toString());
      data.append('role', formData.role);
      data.append('featured', formData.featured.toString());
      data.append('active', formData.active.toString());
      data.append('socialMedia', JSON.stringify(formData.socialMedia));
      data.append('stats', JSON.stringify(formData.stats));

      if (isEditMode) {
        await updateTeamMember(id, data);
        toast.success('Team member updated successfully!');
      } else {
        await createTeamMember(data);
        toast.success('Team member created successfully!');
      }

      navigate('/admin/team');
    } catch (error) {
      toast.error(error.message || 'Failed to save team member');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="admin-form-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading team member data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-form-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/admin/team')}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
        </svg>
        Back to Team
      </button>

      {/* Page Header */}
      <div className="form-page-header">
        <h1>{isEditMode ? 'Edit Team Member' : 'Add New Team Member'}</h1>
        <p className="form-subtitle">
          {isEditMode
            ? 'Update team member information and details'
            : 'Create a new team member profile'
          }
        </p>
      </div>

      {/* Form Card */}
      <div className="admin-form-card">
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Language Tabs */}
          <div className="tabs">
            <button
              type="button"
              className={`tab ${activeTab === 'en' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('en')}
            >
              English *
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'ar' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('ar')}
            >
              العربية *
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'he' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('he')}
            >
              עברית *
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            <p className="form-note-required">
              * All three languages are required
            </p>

            <div className="form-row">
              {/* ✅ RESTORED: Name Field */}
              <div className="form-group">
                <label>Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.translations[activeTab].name}
                  onChange={(e) => handleInputChange(activeTab, 'name', e.target.value)}
                  className={errors[`name_${activeTab}`] ? 'error' : ''}
                  placeholder="Full Name"
                  dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
                />
                {errors[`name_${activeTab}`] && (
                  <span className="error-message">{errors[`name_${activeTab}`]}</span>
                )}
              </div>

              {/* Title Field should be right next to it or below it */}
              <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.translations[activeTab].title}
                  onChange={(e) => handleInputChange(activeTab, 'title', e.target.value)}
                  className={errors[`title_${activeTab}`] ? 'error' : ''}
                  placeholder="Founder | Strategic Advisor"
                  dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
                />
                {errors[`title_${activeTab}`] && (
                  <span className="error-message">{errors[`title_${activeTab}`]}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Quote</label>
              <textarea
                value={formData.translations[activeTab].quote}
                onChange={(e) => handleInputChange(activeTab, 'quote', e.target.value)}
                rows="2"
                placeholder="Personal quote or tagline..."
                dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="form-group">
              <label>Bio <span className="required">*</span></label>
              <textarea
                value={formData.translations[activeTab].bio}
                onChange={(e) => handleInputChange(activeTab, 'bio', e.target.value)}
                className={errors[`bio_${activeTab}`] ? 'error' : ''}
                rows="4"
                placeholder="Professional biography..."
                dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
              />
              {errors[`bio_${activeTab}`] && (
                <span className="error-message">{errors[`bio_${activeTab}`]}</span>
              )}
            </div>

            {/* Specialties */}
            <div className="form-group">
              <label>Specialties</label>
              {formData.translations[activeTab].specialties.map((specialty, index) => (
                <div key={index} className="input-group">
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => handleSpecialtyChange(activeTab, index, e.target.value)}
                    placeholder={`Specialty ${index + 1}`}
                    dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
                  />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveSpecialty(activeTab, index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-add"
                onClick={() => handleAddSpecialty(activeTab)}
              >
                + Add Specialty
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'error' : ''}
                  placeholder="member@allinrealestate.net"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="04-6666599"
                />
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="form-section">
            <h3>License Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>License Number <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className={errors.licenseNumber ? 'error' : ''}
                  placeholder="מספר רישיון"
                />
                {errors.licenseNumber && (
                  <span className="error-message">{errors.licenseNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label>License Type</label>
                <select
                  value={formData.licenseType}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                >
                  <option value="Real Estate Agent">Real Estate Agent</option>
                  <option value="Broker">Broker</option>
                  <option value="Appraiser">Appraiser</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div className="form-section">
            <h3>Profile Image</h3>

            <div className="form-group">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Profile preview" className="image-preview-large" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={handleRemoveImage}
                    title="Remove Image"
                  >
                    {/* SVG for a clean white X */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  className="image-drop-zone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                  <p>Drag & drop profile image here</p>
                  <p className="text-small">or</p>
                  <label className="btn-upload">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p className="text-small">Max 10MB (JPEG, PNG, WebP)</p>
                </div>
              )}


            </div>
          </div>

          {/* Display Settings */}
          <div className="form-section">
            <h3>Display Settings</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                />
                <p className="field-hint">Lower numbers appear first</p>
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Founder">Founder</option>
                  <option value="Partner">Partner</option>
                  <option value="Agent">Agent</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Manager">Manager</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">


              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  Active Member
                </label>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="form-section">
            <h3>Social Media (Optional)</h3>

            <div className="form-row">
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={formData.socialMedia.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="url"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="url"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="url"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="form-section">
            <h3>Professional Stats (Optional)</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Years Experience</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stats.yearsExperience}
                  onChange={(e) => setFormData({
                    ...formData,
                    stats: { ...formData.stats, yearsExperience: Number(e.target.value) }
                  })}
                />
              </div>

              <div className="form-group">
                <label>Projects Completed</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stats.projectsCompleted}
                  onChange={(e) => setFormData({
                    ...formData,
                    stats: { ...formData.stats, projectsCompleted: Number(e.target.value) }
                  })}
                />
              </div>

              <div className="form-group">
                <label>Clients Satisfied</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stats.clientsSatisfied}
                  onChange={(e) => setFormData({
                    ...formData,
                    stats: { ...formData.stats, clientsSatisfied: Number(e.target.value) }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/admin/team')}
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
                isEditMode ? 'Update Team Member' : 'Create Team Member'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberForm;