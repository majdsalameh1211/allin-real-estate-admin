// src/pages/admin/AdminServices/AdminServices.jsx
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import './AdminServices.css';
import DeleteConfirmModal from '../../global/DeleteConfirmModal/DeleteConfirmModal.jsx';

const AdminServices = () => {
  const { searchQuery, scope } = useOutletContext();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
    title: ""
  });
  // Add state for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services?lang=en');
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to fetch services');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery || scope !== 'services') {
      return services;
    }

    const query = searchQuery.toLowerCase();

    return services.filter(service => {
      const matchTitle = service.title?.toLowerCase().includes(query);
      const matchDescription = service.description?.toLowerCase().includes(query);
      const matchOrder = service.order?.toString().includes(query);

      return matchTitle || matchDescription || matchOrder;
    });
  }, [services, searchQuery, scope]);

  const handleDelete = async (id) => {


    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted successfully!');
      setDeleteConfirm(null);
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
      console.error(error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Services</h1>
          <p>Manage your service offerings</p>
          {searchQuery && scope === 'services' && (
            <p className="search-results-count">
              Found {filteredServices.length} of {services.length} services
            </p>
          )}
        </div>
        <button className="btn-primary" onClick={() => navigate('/admin/services/new')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading services...</div>
      ) : filteredServices.length === 0 ? (
        <div className="admin-empty">
          <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" />
          </svg>
          <h3>{searchQuery ? 'No services match your search' : 'No services yet'}</h3>
          <p>{searchQuery ? 'Try adjusting your search query' : 'Create your first service offering'}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-table-container desktop-only">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Icon</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>#{service.order}</td>
                    <td>
                      <img
                        src={service.icon}
                        alt={service.title}
                        className="table-image"
                      />
                    </td>
                    <td className="font-semibold">{service.title}</td>
                    <td style={{ maxWidth: '300px' }}>
                      {service.description?.substring(0, 60)}...
                    </td>
                    <td>
                      <span className={`badge badge-${service.active ? 'active' : 'inactive'}`}>
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => navigate(`/admin/services/${service.id}/edit`)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => setDeleteConfirm({ id: service.id, name: service.translations?.en?.title })}
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
            {filteredServices.map((service) => (
              <div key={service.id} className="service-card">
                <div className="card-header">
                  <div className="service-icon">
                    <img src={service.icon} alt={service.title} />
                  </div>
                  <div className="service-order">#{service.order}</div>
                </div>

                <div className="card-content">
                  <h3 className="card-title">{service.title}</h3>
                  <p className="card-description">{service.description}</p>

                  <div className="card-status">
                    <span className={`badge badge-${service.active ? 'active' : 'inactive'}`}>
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-card-action btn-edit"
                    onClick={() => navigate(`/admin/services/${service.id}/edit`)}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="btn-card-action btn-delete"
                    onClick={() => handleDelete(service.id)}
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
        onConfirm={handleDelete}
        title="Delete Service"
        itemName={deleteConfirm?.name}
        itemType="Service"
      />
    </div>
  );
};

export default AdminServices;