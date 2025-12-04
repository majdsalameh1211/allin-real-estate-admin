// src/pages/admin/ServiceFormPage/ServiceFormPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import ServiceForm from '../ServiceForm/ServiceForm';
import './ServiceFormPage.css';

const ServiceFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchServiceData();
    }
  }, [id]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${id}?includeAllTranslations=true`);
      setInitialData(response.data);
    } catch (error) {
      toast.error('Failed to load service data');
      console.error(error);
      navigate('/admin/services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // Build FormData for file upload
      const data = new FormData();
      
      // Add icon file if exists
      if (formData.iconFile) {
        data.append('iconFile', formData.iconFile);
      }
      
      // Add icon URL if no file (for URL-based icons)
      if (!formData.iconFile && formData.icon) {
        data.append('icon', formData.icon);
      }
      
      // Add other fields
      data.append('order', formData.order);
      data.append('active', formData.active);
      data.append('translations', JSON.stringify(formData.translations));
      
      if (formData.relatedProjects && formData.relatedProjects.length > 0) {
        data.append('relatedProjects', JSON.stringify(formData.relatedProjects));
      }

      // Send request
      if (isEditMode) {
        await api.put(`/services/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Service updated successfully!');
      } else {
        await api.post('/services', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Service created successfully!');
      }
      
      navigate('/admin/services');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update service' : 'Failed to create service');
      console.error(error);
    }
  };

  const handleCancel = () => {
    navigate('/admin/services');
  };

  if (loading) {
    return (
      <div className="service-form-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading service data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="service-form-page">
      <div className="form-page-header">
        <button className="back-button" onClick={() => navigate('/admin/services')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
          </svg>
          Back to Services
        </button>

        <div>
          <h1>{isEditMode ? 'Edit Service' : 'Add New Service'}</h1>
          <p>{isEditMode ? 'Update service information' : 'Create a new service offering'}</p>
        </div>
      </div>

      <div className="admin-form-card">
        <ServiceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default ServiceFormPage;