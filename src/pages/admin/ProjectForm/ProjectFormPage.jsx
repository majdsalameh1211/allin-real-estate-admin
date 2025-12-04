// src/pages/admin/ProjectFormPage/ProjectFormPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import UniversalForm from './ProjectForm';
import './ProjectFormPage.css';

const ProjectFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${id}?includeAllTranslations=true`);
      setProjectData(response.data);
    } catch (error) {
      toast.error('Failed to load project details');
      console.error(error);
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (submitData) => {
    try {
      const isFormData = submitData instanceof FormData;
      const config = isFormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : {};

      if (isEditMode) {
        await api.put(`/projects/${id}`, submitData, config);
        toast.success('Project updated successfully!');
      } else {
        await api.post('/projects', submitData, config);
        toast.success('Project created successfully!');
      }

      navigate('/admin/projects');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update project' : 'Failed to create project');
      console.error(error);
    }
  };

  const handleCancel = () => {
    navigate('/admin/projects');
  };

  if (loading) {
    return (
      <div className="project-form-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-form-page">
      <button className="back-button" onClick={handleCancel}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
        </svg>
        Back to Projects
      </button>

      <div className="form-page-header">
        <h1>{isEditMode ? 'Edit Project' : 'Add New Project'}</h1>
        <p className="form-subtitle">
          {isEditMode
            ? 'Update project details and images'
            : 'Create a new real estate project'
          }
        </p>
      </div>

      <div className="admin-form-card">
        <UniversalForm
          type="project"
          mode={isEditMode ? 'update' : 'create'}
          initialData={projectData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default ProjectFormPage;