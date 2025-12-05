// src/pages/admin/AdminProjects.jsx
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import './AdminProjects.css';
import DeleteConfirmModal from '../../global/DeleteConfirmModal/DeleteConfirmModal.jsx';

const AdminProjects = () => {
  const { searchQuery, scope } = useOutletContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects?lang=en');
      const projectsData = response.data.projects || response.data;
      setProjects(projectsData);
    } catch (error) {
      toast.error('Failed to fetch projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery || scope !== 'projects') {
      return projects;
    }

    const query = searchQuery.toLowerCase();

    return projects.filter(project => {
      const matchTitle = project.title?.toLowerCase().includes(query);
      const matchLocation = project.location?.toLowerCase().includes(query);
      const matchShortDesc = project.shortDesc?.toLowerCase().includes(query);
      const matchFullDesc = project.fullDesc?.toLowerCase().includes(query);
      const matchType = project.type?.toLowerCase().includes(query);
      const matchPrice = project.price?.toString().includes(query);

      return matchTitle || matchLocation || matchShortDesc || matchFullDesc || matchType || matchPrice;
    });
  }, [projects, searchQuery, scope]);

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleteConfirm.id}`);
      toast.success('Project deleted successfully');
      setDeleteConfirm(null);
      fetchProjects();
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const handleToggleFeatured = async (project) => {
    try {
      // 🔴 FIX: Send ONLY the featured field, not the whole object.
      // This prevents the backend from crashing on translation parsing.
      await api.put(`/projects/${project.id}`, {
        featured: !project.featured
      });

      toast.success('Featured status updated!');
      fetchProjects(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update featured status');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage your real estate projects</p>
          {searchQuery && scope === 'projects' && (
            <p className="search-results-count">
              Found {filteredProjects.length} of {projects.length} projects
            </p>
          )}
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/admin/projects/new')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Add Project
        </button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="admin-empty">
          <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
          <h3>{searchQuery ? 'No projects match your search' : 'No projects yet'}</h3>
          <p>{searchQuery ? 'Try adjusting your search query' : 'Create your first real estate project'}</p>
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
                  <th>Location</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      {project.mainImage ? (
                        <img
                          src={project.mainImage}
                          alt={project.title}
                          className="table-image"
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </td>
                    <td className="font-semibold">
                      {project.title}
                      {project.badge && (
                        <span className={`badge-sample ${project.badge}`}>
                          {project.badge}
                        </span>
                      )}
                    </td>
                    <td>{project.location}</td>
                    <td>
                      {project.price && project.price > 0
                        ? `${project.currency} ${Number(project.price).toLocaleString()}`
                        : '--'}
                    </td>
                    <td>
                      <span className={`badge badge-${project.type}`}>
                        {project.type === 'forSale' && 'For Sale'}
                        {project.type === 'forRent' && 'For Rent'}
                        {project.type === 'sold' && 'Sold'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${project.status}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      {/* Featured Column */}
                      <button
                        className="btn-icon"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => handleToggleFeatured(project)}
                        title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        {project.featured ? (
                          /* Active: Solid Gold Star */
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        ) : (
                          /* Inactive: Gray Outline Star */
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => setDeleteConfirm({ id: project.id, name: project.title })}
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
            {filteredProjects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="card-image">
                  {project.mainImage ? (
                    <img src={project.mainImage} alt={project.title} />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                  {project.badge && (
                    <span className={`project-badge badge-${project.badge}`}>
                      {project.badge}
                    </span>
                  )}
                  {project.featured && (
                    <span className="featured-badge">⭐ Featured</span>
                  )}
                </div>

                <div className="card-content">
                  <h3 className="card-title">{project.title}</h3>
                  <p className="card-location">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    {project.location}
                  </p>

                  {project.price && (
                    <p className="card-price">
                      {project.currency} {Number(project.price).toLocaleString()}
                    </p>
                  )}

                  <div className="card-badges">
                    <span className={`badge badge-${project.type}`}>
                      {project.type === 'forSale' && 'For Sale'}
                      {project.type === 'forRent' && 'For Rent'}
                      {project.type === 'sold' && 'Sold'}
                    </span>
                    <span className={`badge badge-${project.status}`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="card-details">
                    {project.bedrooms && (
                      <div className="detail-item">
                        <span className="detail-label">Bedrooms</span>
                        <span className="detail-value">{project.bedrooms}</span>
                      </div>
                    )}
                    {project.bathrooms && (
                      <div className="detail-item">
                        <span className="detail-label">Bathrooms</span>
                        <span className="detail-value">{project.bathrooms}</span>
                      </div>
                    )}
                    {project.area && (
                      <div className="detail-item">
                        <span className="detail-label">Area</span>
                        <span className="detail-value">{project.area} sqm</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-card-action btn-edit"
                    onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="btn-card-action btn-delete"
                    onClick={() => handleDelete(project.id)}
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
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        itemName={deleteConfirm?.name}
        itemType="project"
      />
    </div>
  );
};

export default AdminProjects;