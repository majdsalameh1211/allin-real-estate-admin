// src/components/ServiceForm.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './ServiceForm.css';

const ServiceForm = ({ initialData, onSubmit, onCancel }) => {
    const [activeTab, setActiveTab] = useState('en');
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState('');

    const [formData, setFormData] = useState({
        order: 1,
        icon: '',
        translations: {
            en: { title: '', description: '' },
            ar: { title: '', description: '' },
            he: { title: '', description: '' }
        },
        active: true,
        relatedProjects: []
    });

    // Pre-fill form when editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                order: initialData.order || 1,
                icon: initialData.icon || '',
                translations: initialData.translations || {
                    en: { title: '', description: '' },
                    ar: { title: '', description: '' },
                    he: { title: '', description: '' }
                },
                active: initialData.active !== undefined ? initialData.active : true,
                relatedProjects: initialData.relatedProjects || []
            });
            
            // Set existing icon as preview
            if (initialData.icon) {
                setIconPreview(initialData.icon);
            }
        } else {
            setFormData({
                order: 1,
                icon: '',
                translations: {
                    en: { title: '', description: '' },
                    ar: { title: '', description: '' },
                    he: { title: '', description: '' }
                },
                active: true,
                relatedProjects: []
            });
            setIconPreview('');
            setIconFile(null);
        }
    }, [initialData]);

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

            setIconFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setIconPreview(e.target.result);
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

    // Remove icon
    const handleRemoveIcon = () => {
        setIconFile(null);
        setIconPreview('');
        setFormData(prev => ({ ...prev, icon: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all languages are filled
        const languages = ['en', 'ar', 'he'];
        for (const lang of languages) {
            if (!formData.translations[lang].title || !formData.translations[lang].description) {
                toast.error(`Please fill in all required fields for ${lang.toUpperCase()}`);
                return;
            }
        }

        const submitData = {
            ...formData,
            order: Number(formData.order),
            iconFile: iconFile // Include file for upload
        };

        onSubmit(submitData);
    };

    return (
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

            {/* Translation Fields */}
            <div className="tab-content">
                <p className="form-note-required">
                    * All three languages are required
                </p>

                <div className="form-group">
                    <label>Title *</label>
                    <input
                        type="text"
                        value={formData.translations[activeTab].title}
                        onChange={(e) => handleInputChange(activeTab, 'title', e.target.value)}
                        required
                        dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
                    />
                </div>

                <div className="form-group">
                    <label>Description *</label>
                    <textarea
                        rows="4"
                        value={formData.translations[activeTab].description}
                        onChange={(e) => handleInputChange(activeTab, 'description', e.target.value)}
                        required
                        dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
                    />
                </div>
            </div>

            {/* Service Details */}
            <div className="form-section">
                <h3>Service Details</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>Display Order *</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* Icon Upload */}
                <div className="form-group">
                    <label>Service Icon</label>
                    
                    {iconPreview ? (
                        <div className="icon-preview-container">
                            <img src={iconPreview} alt="Icon preview" className="icon-preview-image" />
                            <button
                                type="button"
                                className="btn-remove-icon"
                                onClick={handleRemoveIcon}
                            >
                                ✕ Remove
                            </button>
                        </div>
                    ) : (
                        <div
                            className="icon-drop-zone"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                            </svg>
                            <p>Drag & drop icon here</p>
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

                <div className="form-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        />
                        Active Service
                    </label>
                </div>
            </div>

            <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary">
                    {initialData ? 'Update Service' : 'Create Service'}
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;