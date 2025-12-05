// src/pages/admin/CourseForm/CourseForm.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './CourseForm.css';

const CourseForm = ({ initialData, onSubmit, onCancel }) => {
  const [activeTab, setActiveTab] = useState('en');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    translations: {
      en: { title: '', description: '', level: 'Beginner' },
      ar: { title: '', description: '', level: 'مبتدئ' },
      he: { title: '', description: '', level: 'מתחיל' }
    },
    price: null,  // Changed from 0 to null
    currency: 'ILS',
    duration: '',
    instructor: 'ALL IN Team',

    active: true,
    order: 0,
    image: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        translations: initialData.translations || {
          en: { title: '', description: '', level: 'Beginner' },
          ar: { title: '', description: '', level: 'مبتدئ' },
          he: { title: '', description: '', level: 'מתחיל' }
        },
        price: initialData.price || 0,
        currency: initialData.currency || 'ILS',
        duration: initialData.duration || '',
        instructor: initialData.instructor || 'ALL IN Team',
        active: initialData.active !== undefined ? initialData.active : true,
        order: initialData.order || 0,
        image: initialData.image || ''
      });

      if (initialData.image) {
        setImagePreview(initialData.image);
      }
    }
  }, [initialData]);

  // Handlers
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      const langs = ['en', 'ar', 'he'];
      for (const lang of langs) {
        if (!formData.translations[lang].title) {
          toast.error(`Title is required for ${lang.toUpperCase()}`);
          setSubmitting(false);
          return;
        }
      }

      if (!formData.duration) {
        toast.error('Duration is required');
        setSubmitting(false);
        return;
      }

      // 🐛 DEBUG: Log what we're sending
      console.log('📤 SUBMITTING COURSE DATA:');
      console.log('   - Has imageFile?', !!imageFile);
      console.log('   - imageFile details:', imageFile ? {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      } : 'None');
      console.log('   - Has image URL?', !!formData.image);
      console.log('   - Translations:', formData.translations);
      console.log('   - Price:', formData.price);

      // Prepare FormData
      const data = new FormData();
      data.append('translations', JSON.stringify(formData.translations));

      // Only append price if it's a valid number
      const priceValue = Number(formData.price);
      if (!isNaN(priceValue) && priceValue > 0) {
        console.log('✅ Appending price:', priceValue);
        data.append('price', priceValue);
      } else {
        console.log('⚠️ Price is empty or invalid, not appending (will use backend default: null)');
        // Don't append price at all - let backend use default null
      }

      data.append('currency', formData.currency);
      data.append('duration', formData.duration);
      data.append('instructor', formData.instructor);
      data.append('link', formData.link);
      data.append('active', formData.active);
      data.append('order', formData.order);


      if (imageFile) {
        console.log('✅ Appending imageFile to FormData');
        data.append('imageFile', imageFile);
      } else if (formData.image) {
        console.log('✅ Appending image URL to FormData');
        data.append('image', formData.image);
      } else {
        console.log('⚠️ No image provided');
      }

      console.log('📨 Calling onSubmit with FormData...');
      await onSubmit(data);
      console.log('✅ onSubmit completed successfully');
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      {/* Language Tabs */}
      <div className="tabs">
        {['en', 'ar', 'he'].map(lang => (
          <button
            key={lang}
            type="button"
            className={`tab ${activeTab === lang ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(lang)}
          >
            {lang === 'en' ? 'English' : lang === 'ar' ? 'العربية' : 'עברית'}
          </button>
        ))}
      </div>

      {/* Content Fields */}
      <div className="tab-content">
        <div className="form-group">
          <label>Course Title *</label>
          <input
            type="text"
            value={formData.translations[activeTab].title}
            onChange={(e) => handleInputChange(activeTab, 'title', e.target.value)}
            required
            dir={activeTab !== 'en' ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            rows="3"
            value={formData.translations[activeTab].description}
            onChange={(e) => handleInputChange(activeTab, 'description', e.target.value)}
            required
            dir={activeTab !== 'en' ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="form-group">
          <label>Level</label>
          <input
            type="text"
            value={formData.translations[activeTab].level}
            onChange={(e) => handleInputChange(activeTab, 'level', e.target.value)}
            placeholder={activeTab === 'en' ? 'Beginner' : activeTab === 'ar' ? 'مبتدئ' : 'מתחיל'}
            dir={activeTab !== 'en' ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      {/* General Details */}
      <div className="form-section">
        <h3>Course Details</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Price (Optional)</label>
            <input
              type="number"
              min="0"
              value={formData.price || ''}
              onChange={(e) => setFormData({
                ...formData,
                price: e.target.value === '' ? null : Number(e.target.value)
              })}
              placeholder="Leave empty for free"
            />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="ILS">ILS (₪)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration *</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g. 2h 30m"
              required
            />
          </div>
          <div className="form-group">
            <label>Instructor</label>
            <input
              type="text"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Display Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label" style={{ marginTop: '30px' }}>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              Active Course
            </label>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="form-section">
        <h3>Thumbnail Image (Optional)</h3>

        <div className="form-group">

          {imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview-large" />



              <button
                type="button"
                className="btn-remove-image"
                onClick={handleRemoveImage}
              >
                {/* SVG for a clean white X */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              {/* ----------------------------------------------- */}

            </div>
          ) : (
            <div
              className="image-drop-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9ca3af' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p>Drag & drop image here</p>
              <label className="btn-upload">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer">

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : (initialData ? 'Update Course' : 'Create Course')}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;