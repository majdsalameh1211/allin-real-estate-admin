// src/pages/admin/TestimonialFormPage/TestimonialFormPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import TestimonialForm from '../TestimonialForm/TestimonialForm';
import './TestimonialFormPage.css';

const TestimonialFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchTestimonialData();
    }
  }, [id]);

  const fetchTestimonialData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/testimonials/${id}`, { 
        params: { includeAllTranslations: "true" } 
      });
      setInitialData(response.data);
    } catch (error) {
      toast.error('Failed to load testimonial data');
      console.error(error);
      navigate('/admin/testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await api.put(`/testimonials/${id}`, formData);
        toast.success('Testimonial updated successfully!');
      } else {
        await api.post('/testimonials', formData);
        toast.success('Testimonial created successfully!');
      }
      navigate('/admin/testimonials');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update testimonial' : 'Failed to create testimonial');
      console.error(error);
    }
  };

  const handleCancel = () => {
    navigate('/admin/testimonials');
  };

  if (loading) {
    return (
      <div className="testimonial-form-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading testimonial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="testimonial-form-page">
      <div className="form-page-header">
        <button className="back-button" onClick={() => navigate('/admin/testimonials')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
          </svg>
          Back to Reviews
        </button>

        <div>
          <h1>{isEditMode ? 'Edit Review' : 'Add New Review'}</h1>
          <p>{isEditMode ? 'Update customer testimonial' : 'Create a new customer review'}</p>
        </div>
      </div>

      <div className="admin-form-card">
        <TestimonialForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default TestimonialFormPage;