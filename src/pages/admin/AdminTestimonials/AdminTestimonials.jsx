// src/pages/admin/AdminTestimonials/AdminTestimonials.jsx
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import './AdminTestimonials.css';
import DeleteConfirmModal from '../../global/DeleteConfirmModal/DeleteConfirmModal.jsx';

const AdminTestimonials = () => {
  const { searchQuery, scope } = useOutletContext();
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add state for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/testimonials?lang=en');
      setTestimonials(response.data);
    } catch (error) {
      toast.error('Failed to fetch testimonials');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter testimonials based on search query
  const filteredTestimonials = useMemo(() => {
    if (!searchQuery || scope !== 'reviews') {
      return testimonials;
    }

    const query = searchQuery.toLowerCase();

    return testimonials.filter(testimonial => {
      const matchAuthor = testimonial.author?.toLowerCase().includes(query);
      const matchText = testimonial.text?.toLowerCase().includes(query);
      const matchLocation = testimonial.location?.toLowerCase().includes(query);
      const matchOrder = testimonial.order?.toString().includes(query);

      return matchAuthor || matchText || matchLocation || matchOrder;
    });
  }, [testimonials, searchQuery, scope]);

  const handleDelete = async (id) => {

    try {
      await api.delete(`/testimonials/${id}`);
      toast.success('Testimonial deleted successfully!');
      setDeleteConfirm(null);
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
      console.error(error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill={i < rating ? '#d4af37' : '#e5e7eb'}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Reviews</h1>
          <p>Manage customer reviews and feedback</p>
          {searchQuery && scope === 'reviews' && (
            <p className="search-results-count">
              Found {filteredTestimonials.length} of {testimonials.length} reviews
            </p>
          )}
        </div>
        <button className="btn-primary" onClick={() => navigate('/admin/testimonials/new')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Add Review
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading Reviews...</div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="admin-empty">
          <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          <h3>{searchQuery ? 'No reviews match your search' : 'No Reviews yet'}</h3>
          <p>{searchQuery ? 'Try adjusting your search query' : 'Add your first customer review'}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-table-container desktop-only">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Author</th>
                  <th>Location</th>
                  <th>Rating</th>
                  <th>Reviews</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestimonials.map((testimonial) => (
                  <tr key={testimonial.id}>
                    <td>#{testimonial.order}</td>
                    <td className="font-semibold">{testimonial.author}</td>
                    <td>{testimonial.location}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {renderStars(testimonial.rating)}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      {testimonial.text?.substring(0, 80)}...
                    </td>
                    <td>
                      <span className={`badge badge-${testimonial.active ? 'active' : 'inactive'}`}>
                        {testimonial.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => navigate(`/admin/testimonials/${testimonial.id}/edit`)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => setDeleteConfirm({ id: testimonial.id, name: testimonial.translations?.en?.author })}
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
            {filteredTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="card-header">
                  <div className="header-left">
                    <div className="testimonial-order">#{testimonial.order}</div>

                    <div className="testimonial-rating">
                      {renderStars(testimonial.rating)}
                    </div>
                    <div className="header-badges">
                      <span className={`badge badge-${testimonial.active ? 'active' : 'inactive'}`}>
                        {testimonial.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-content">
                  <div className="quote-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  <p className="testimonial-text">"{testimonial.text}"</p>

                  <div className="testimonial-author">
                    <div className="author-info">
                      <div className="author-name">{testimonial.author}</div>
                      <div className="author-location">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-card-action btn-edit"
                    onClick={() => navigate(`/admin/testimonials/${testimonial.id}/edit`)}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="btn-card-action btn-delete"
                    onClick={() => setDeleteConfirm({ id: testimonial.id, name: testimonial.translations?.en?.author })}
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

export default AdminTestimonials;