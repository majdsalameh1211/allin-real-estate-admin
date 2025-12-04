// src/pages/admin/CourseForm/CourseFormPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createCourse, updateCourse, getCourseForEdit } from '../../../services/api';
import CourseForm from './CourseForm';
import './CourseFormPage.css';

const CourseFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getCourseForEdit(id);
      setInitialData(data);
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (formData) => {
  try {
    console.log('📝 CourseFormPage - handleSubmit called');
    console.log('   - Edit mode?', isEditMode);
    console.log('   - Course ID:', id);
    console.log('   - FormData entries:');
    
    // Log FormData contents
    for (let pair of formData.entries()) {
      if (pair[0] === 'imageFile') {
        console.log(`   - ${pair[0]}:`, {
          name: pair[1].name,
          size: pair[1].size,
          type: pair[1].type
        });
      } else {
        console.log(`   - ${pair[0]}:`, pair[1]);
      }
    }

    if (isEditMode) {
      console.log('🔄 Calling updateCourse API...');
      const result = await updateCourse(id, formData);
      console.log('✅ Update response:', result);
      toast.success('Course updated successfully');
    } else {
      console.log('➕ Calling createCourse API...');
      const result = await createCourse(formData);
      console.log('✅ Create response:', result);
      toast.success('Course created successfully');
    }
    navigate('/admin/courses');
  } catch (error) {
    console.error('❌ Error in handleSubmit:', error);
    console.error('   - Error message:', error.message);
    console.error('   - Error response:', error.response?.data);
    toast.error(error.message || 'Operation failed');
  }
};

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="course-form-page">
       <button className="back-button" onClick={() => navigate('/admin/courses')}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
        </svg>
        Back to Courses
      </button>

      <div className="form-page-header">
        <h1>{isEditMode ? 'Edit Course' : 'Add New Course'}</h1>
        <p className="form-subtitle">
          {isEditMode ? 'Update course details' : 'Create a new educational course'}
        </p>
      </div>

      <div className="admin-form-card">
        <CourseForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/courses')}
        />
      </div>
    </div>
  );
};

export default CourseFormPage;