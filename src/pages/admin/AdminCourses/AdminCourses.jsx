// src/pages/admin/AdminCourses/AdminCourses.jsx
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCourses, deleteCourse } from '../../../services/api';
import './AdminCourses.css';
import DeleteConfirmModal from '../../global/DeleteConfirmModal/DeleteConfirmModal.jsx';

const AdminCourses = () => {
  const { searchQuery, scope } = useOutletContext();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  // Add state for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);


  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching courses from API...');
      // ✅ FIX: Pass 'null' for limit, and 'true' for includeInactive
      const data = await getCourses('en', null, true);
      console.log('✅ Courses fetched:', data.length, 'courses');
      setCourses(data);
    } catch (error) {
      toast.error('Failed to fetch courses');
      console.error('❌ Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery || scope !== 'courses') {
      return courses;
    }

    const query = searchQuery.toLowerCase();

    return courses.filter(course => {
      const matchTitle = course.title?.toLowerCase().includes(query);
      const matchDescription = course.description?.toLowerCase().includes(query);
      const matchInstructor = course.instructor?.toLowerCase().includes(query);

      return matchTitle || matchDescription || matchInstructor;
    });
  }, [courses, searchQuery, scope]);

  const handleDelete = async (id) => {

    try {
      console.log('🗑️ Deleting course:', id);
      await deleteCourse(id);
      console.log('✅ Course deleted successfully');
      toast.success('Course deleted successfully!');
      setDeleteConfirm(null);
      fetchCourses();
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Courses</h1>
          <p>Manage your educational courses</p>
          {searchQuery && scope === 'courses' && (
            <p className="search-results-count">
              Found {filteredCourses.length} of {courses.length} courses
            </p>
          )}
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/admin/courses/new')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Add Course
        </button>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="admin-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <path d="M22 10v6M2 10v6M12 2l8.5 5-8.5 5-8.5-5L12 2z" />
            <path d="M2 10l10 5 10-5" />
            <path d="M12 22V17" />
          </svg>
          <h3>{searchQuery ? 'No courses match your search' : 'No courses yet'}</h3>
          <p>{searchQuery ? 'Try adjusting your search query' : 'Create your first course'}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-table-container desktop-only">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="table-image"
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </td>
                    <td className="font-semibold">{course.title}</td>
                    <td>{course.instructor}</td>
                    <td>{course.duration}</td>
                    <td>
                      {course.price && course.price > 0 && (
                        <span className="course-price-badge">
                          {`${course.currency} ${Number(course.price).toLocaleString()}`}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${course.active ? 'active' : 'inactive'}`}>
                        {course.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() =>
                            setDeleteConfirm({
                              id: course.id,
                              name: course.translations?.en?.title || course.title
                            })
                          }
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="cards-grid mobile-only">
            {filteredCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="card-image">
                  {course.image ? (
                    <img src={course.image} alt={course.title} />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                  <span className="course-price-badge">
                    {course.price > 0
                      ? `${course.currency} ${Number(course.price).toLocaleString()}`
                      : 'Free'}
                  </span>
                </div>

                <div className="card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 className="card-title">{course.title}</h3>
                    <span className={`badge badge-${course.active ? 'active' : 'inactive'}`}>
                      {course.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="card-instructor">By {course.instructor}</p>

                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{course.duration}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Level</span>
                      <span className="detail-value">{course.level}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-card-action btn-edit"
                    onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="btn-card-action btn-delete"
                    onClick={() => setDeleteConfirm({
                      id: course.id,
                      name: course.translations?.en?.title || course.title
                    })}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm?.id)}
        title="Delete Course"
        itemName={deleteConfirm?.name}
        itemType="course"
      />
    </div>
  );
};

export default AdminCourses;