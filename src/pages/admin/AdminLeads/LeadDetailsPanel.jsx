// src/pages/admin/AdminLeads/LeadDetailsPanel.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateLead, assignLead, markLeadAsContacted, closeLead, deleteLead } from '../../../services/api';
import DeleteConfirmModal from '../../global/DeleteConfirmModal/DeleteConfirmModal.jsx';
import './LeadDetailsPanel.css';

const LeadDetailsPanel = ({ lead, onClose, onUpdate, teamMembers, canEdit, canDelete, adminRole }) => {
  const [formData, setFormData] = useState({
    status: lead.status,
    priority: lead.priority,
    notes: lead.notes || '',
    assignedTo: lead.assignedTo?._id || ''
  });
  const [saving, setSaving] = useState(false);
  // Add state for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);


  useEffect(() => {
    // Close panel on ESC key
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData = {
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes
      };

      // Superadmin can also update assignment
      if (adminRole === 'superadmin') {
        updateData.assignedTo = formData.assignedTo || null;
      }

      await updateLead(lead._id, updateData);
      toast.success('Lead updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkContacted = async () => {
    try {
      await markLeadAsContacted(lead._id);
      toast.success('Lead marked as contacted');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update lead');
    }
  };

  const handleCloseLead = async () => {
    if (!window.confirm('Are you sure you want to close this lead?')) return;

    try {
      await closeLead(lead._id);
      toast.success('Lead closed successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to close lead');
    }
  };

const handleDelete = async (id) => {
  try {
    await deleteLead(id);
    toast.success('Lead deleted successfully');
    setDeleteConfirm(null);
    onUpdate();
    onClose();
  } catch (error) {
    toast.error(error.message || 'Failed to delete lead');
  }
};


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Overlay */}
      <div className="panel-overlay" onClick={onClose}></div>

      {/* Panel */}
      <div className="lead-details-panel">
        {/* Header */}
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Lead Details</h2>
            <p className="panel-subtitle">ID: {lead._id}</p>
          </div>
          <button className="btn-close-panel" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="panel-content">
          {/* Permission Notice */}
          {!canEdit && (
            <div className="permission-notice">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <p>READ ONLY - This lead is assigned to {lead.assignedTo?.translations.en.name || 'another admin'}</p>
            </div>
          )}

          {/* Client Information */}
          <div className="panel-section">
            <h3 className="section-title">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Client Information
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p>{lead.fullName}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>
                  <a href={`mailto:${lead.email}`} className="contact-link">
                    {lead.email}
                  </a>
                </p>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <p>
                  <a href={`tel:${lead.phoneNumber}`} className="contact-link">
                    {lead.phoneNumber}
                  </a>
                </p>
              </div>
              <div className="info-item">
                <label>Interest</label>
                <p><span className="inquiry-badge">{lead.inquiryType}</span></p>
              </div>
              <div className="info-item">
                <label>Submission Date</label>
                <p>{formatDate(lead.createdAt)}</p>
              </div>
              <div className="info-item">
                <label>Source</label>
                <p>{lead.source}</p>
              </div>
            </div>
          </div>

          {/* Client Message */}
          <div className="panel-section">
            <h3 className="section-title">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Client Message
            </h3>
            <div className="message-box">
              <p>{lead.message}</p>
            </div>
          </div>

          {/* Lead Management */}
          <div className="panel-section">
            <h3 className="section-title">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Lead Management
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={!canEdit}
                  className="form-select"
                >
                  <option value="New">🔴 New</option>
                  <option value="Contacted">🟡 Contacted</option>
                  <option value="InProgress">🔵 In Progress</option>
                  <option value="Closed">🟢 Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  disabled={!canEdit}
                  className="form-select"
                >
                  <option value="High">🔥 High</option>
                  <option value="Medium">⭐ Medium</option>
                  <option value="Low">🔻 Low</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Assigned To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  disabled={!canEdit || adminRole !== 'superadmin'}
                  className="form-select"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.translations.en.name} - {member.role}
                    </option>
                  ))}
                </select>
                {adminRole !== 'superadmin' && (
                  <small className="help-text">Only superadmin can reassign leads</small>
                )}
              </div>
            </div>

            {/* Timestamps */}
            {(lead.contactedAt || lead.closedAt) && (
              <div className="timestamps">
                {lead.contactedAt && (
                  <div className="timestamp-item">
                    <span className="timestamp-label">Contacted:</span>
                    <span>{formatDate(lead.contactedAt)}</span>
                  </div>
                )}
                {lead.closedAt && (
                  <div className="timestamp-item">
                    <span className="timestamp-label">Closed:</span>
                    <span>{formatDate(lead.closedAt)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className="panel-section">
            <h3 className="section-title">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Admin Notes
            </h3>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={!canEdit}
              placeholder="Add internal notes about this lead..."
              rows={6}
              className="notes-textarea"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="panel-footer">
          {canEdit ? (
            <>
              <button
                className="btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <div className="footer-actions-right">
                {lead.status !== 'Contacted' && lead.status !== 'Closed' && (
                  <button
                    className="btn-action-secondary"
                    onClick={handleMarkContacted}
                    disabled={saving}
                  >
                    Mark as Contacted
                  </button>
                )}

                {lead.status !== 'Closed' && (
                  <button
                    className="btn-action-secondary"
                    onClick={handleCloseLead}
                    disabled={saving}
                  >
                    Close Lead
                  </button>
                )}

                {canDelete && (
                  <button
                    className="btn-danger"
                    onClick={() =>
                      setDeleteConfirm({
                        id: lead._id,
                        name: lead.translations?.en?.name || lead.fullName,
                      })
                    }
                    disabled={saving}
                  >
                    Delete
                  </button>
                )}

                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <button className="btn-secondary full-width" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm?.id)}
        title="Delete Lead"
        itemName={deleteConfirm?.name}
        itemType="lead"
      />
    </>

  );
};

export default LeadDetailsPanel;