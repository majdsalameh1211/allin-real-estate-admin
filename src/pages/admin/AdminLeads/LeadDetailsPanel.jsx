import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getLeadById,
  updateLead,
  assignLead,
  markLeadAsContacted,
  closeLead,
  deleteLead,
  getAdminUsers,
  getCurrentAdmin
} from '../../../services/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Tag,
  DollarSign,
  MessageSquare,
  FileText,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import './LeadDetailsPanel.css';

const LeadDetailsPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    adminNotes: '',
    assignedTo: ''
  });

  // Permissions
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canDelete: false,
    canAssign: false
  });

  useEffect(() => {
    const storedAdmin = getCurrentAdmin();
    if (storedAdmin) {
      setAdmin(storedAdmin);
    }
  }, []);

  useEffect(() => {
    fetchLead();
    fetchTeamMembers();
  }, [id]);

  useEffect(() => {
    if (lead && admin) {
      calculatePermissions();
    }
  }, [lead, admin]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const data = await getLeadById(id);
      setLead(data);
      setFormData({
        status: data.status || '',
        priority: data.priority || '',
        adminNotes: data.adminNotes || '',
        assignedTo: data.assignedTo?._id || ''
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load lead details');
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const members = await getAdminUsers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members');
    }
  };

  const calculatePermissions = () => {
    const isSuperAdmin = admin.role === 'superadmin';
    const isAssignedToMe = lead.assignedTo && lead.assignedTo._id === admin._id;

    setPermissions({
      canEdit: isSuperAdmin || isAssignedToMe,
      canDelete: isSuperAdmin,
      canAssign: isSuperAdmin
    });
  };

  const handleAssignment = async (newAssignedTo) => {
    if (!permissions.canAssign) return;

    try {
      setSaving(true);
      console.log('🔄 Assigning lead:', id, 'to:', newAssignedTo);
      
      const updatedLead = await assignLead(id, newAssignedTo);
      setLead(updatedLead);
      setFormData(prev => ({ ...prev, assignedTo: newAssignedTo }));
      
      alert('Lead assigned successfully!');
      setSaving(false);
    } catch (error) {
      console.error('❌ Assignment failed:', error);
      alert('Failed to assign lead');
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!permissions.canEdit) return;

    try {
      setSaving(true);
      const updatedLead = await updateLead(id, {
        status: formData.status,
        priority: formData.priority,
        adminNotes: formData.adminNotes
      });
      setLead(updatedLead);
      alert('Lead updated successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Failed to update lead:', error);
      alert('Failed to update lead');
      setSaving(false);
    }
  };

  const handleMarkAsContacted = async () => {
    if (!permissions.canEdit) return;

    try {
      setSaving(true);
      const updatedLead = await markLeadAsContacted(id);
      setLead(updatedLead);
      setFormData(prev => ({ ...prev, status: 'contacted' }));
      alert('Lead marked as contacted!');
      setSaving(false);
    } catch (error) {
      console.error('Failed to mark as contacted:', error);
      alert('Failed to update lead');
      setSaving(false);
    }
  };

  const handleCloseLead = async () => {
    if (!permissions.canEdit) return;

    try {
      setSaving(true);
      const updatedLead = await closeLead(id);
      setLead(updatedLead);
      setFormData(prev => ({ ...prev, status: 'closed' }));
      alert('Lead closed successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Failed to close lead:', error);
      alert('Failed to close lead');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!permissions.canDelete) return;

    try {
      await deleteLead(id);
      alert('Lead deleted successfully!');
      navigate('/admin/leads');
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead');
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="lead-details-loading">
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="lead-details-error">
        <AlertCircle size={48} />
        <p>{error || 'Lead not found'}</p>
        <button onClick={() => navigate('/admin/leads')} className="btn-back">
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="lead-details-page">
      {/* Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/leads')}>
          <ArrowLeft size={20} />
          <span>Back to Leads</span>
        </button>
        <div className="header-actions">
          {permissions.canEdit && (
            <button 
              className="btn-save" 
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
          {permissions.canDelete && (
            <button 
              className="btn-delete" 
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="details-content">
        {/* Main Column */}
        <div className="details-main">
          {/* Client Info Card */}
          <div className="details-section">
            <div className="section-header">
              <User size={20} />
              <h2>Client Information</h2>
            </div>
            <div className="client-avatar">
              {lead.fullName.charAt(0).toUpperCase()}
            </div>
            <h1 className="client-name">{lead.fullName}</h1>
            
            <div className="info-grid">
              <div className="info-item">
                <Mail size={18} />
                <div>
                  <div className="info-label">Email</div>
                  <div className="info-value">{lead.email}</div>
                </div>
              </div>
              
              <div className="info-item">
                <Phone size={18} />
                <div>
                  <div className="info-label">Phone</div>
                  <div className="info-value">{lead.phone}</div>
                </div>
              </div>

              {lead.location && (
                <div className="info-item">
                  <MapPin size={18} />
                  <div>
                    <div className="info-label">Location</div>
                    <div className="info-value">{lead.location}</div>
                  </div>
                </div>
              )}

              <div className="info-item">
                <Calendar size={18} />
                <div>
                  <div className="info-label">Submitted</div>
                  <div className="info-value">{formatDate(lead.createdAt)}</div>
                </div>
              </div>

              {lead.propertyInterest && (
                <div className="info-item">
                  <Tag size={18} />
                  <div>
                    <div className="info-label">Property Interest</div>
                    <div className="info-value">{lead.propertyInterest}</div>
                  </div>
                </div>
              )}

              {lead.budget && (
                <div className="info-item">
                  <DollarSign size={18} />
                  <div>
                    <div className="info-label">Budget</div>
                    <div className="info-value">₪{lead.budget.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message Card */}
          {lead.message && (
            <div className="details-section">
              <div className="section-header">
                <MessageSquare size={20} />
                <h2>Message</h2>
              </div>
              <div className="message-box">
                {lead.message}
              </div>
            </div>
          )}

          {/* Admin Notes Card */}
          <div className="details-section">
            <div className="section-header">
              <FileText size={20} />
              <h2>Admin Notes</h2>
            </div>
            <textarea
              className="notes-textarea"
              placeholder="Add internal notes about this lead..."
              value={formData.adminNotes}
              onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              disabled={!permissions.canEdit}
              rows="6"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="details-sidebar">
          {/* Lead Management Card */}
          <div className="details-section">
            <h3>Lead Management</h3>
            
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={!permissions.canEdit}
                className="form-select"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                disabled={!permissions.canEdit}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assigned To</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleAssignment(e.target.value)}
                disabled={!permissions.canAssign}
                className="form-select"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(admin => (
                  <option key={admin._id} value={admin._id}>
                    {admin.firstName} {admin.lastName}
                  </option>
                ))}
              </select>
            </div>

            {lead.assignedTo && (
              <div className="assigned-info">
                <div className="assigned-avatar">
                  {lead.assignedTo.firstName?.charAt(0)}{lead.assignedTo.lastName?.charAt(0)}
                </div>
                <div>
                  <div className="assigned-name">
                    {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                  </div>
                  <div className="assigned-role">{lead.assignedTo.role}</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="details-section">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              {permissions.canEdit && lead.status !== 'contacted' && (
                <button 
                  className="btn-action btn-contacted"
                  onClick={handleMarkAsContacted}
                  disabled={saving}
                >
                  <CheckCircle size={18} />
                  <span>Mark as Contacted</span>
                </button>
              )}
              
              {permissions.canEdit && lead.status !== 'closed' && (
                <button 
                  className="btn-action btn-close"
                  onClick={handleCloseLead}
                  disabled={saving}
                >
                  <XCircle size={18} />
                  <span>Close Lead</span>
                </button>
              )}

              <a 
                href={`mailto:${lead.email}`} 
                className="btn-action btn-email"
              >
                <Mail size={18} />
                <span>Send Email</span>
              </a>

              <a 
                href={`tel:${lead.phone}`} 
                className="btn-action btn-phone"
              >
                <Phone size={18} />
                <span>Call Client</span>
              </a>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="details-section">
            <h3>Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Lead Created</div>
                  <div className="timeline-date">{formatDate(lead.createdAt)}</div>
                </div>
              </div>
              {lead.updatedAt !== lead.createdAt && (
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Last Updated</div>
                    <div className="timeline-date">{formatDate(lead.updatedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <AlertCircle size={48} />
            </div>
            <h2>Delete Lead?</h2>
            <p>Are you sure you want to delete this lead? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={handleDelete}
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailsPanel;