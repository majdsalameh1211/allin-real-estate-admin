// src/pages/admin/AdminLeads/AdminLeads.jsx
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  getAllLeads, 
  deleteLead,
  getPublicTeamMembers,
  getCurrentAdmin,
  getAdminRole
} from '../../../services/api';
import LeadDetailsPanel from './LeadDetailsPanel';
import './AdminLeads.css';
import DeleteConfirmModal from '../../global/DeleteConfirmModal/DeleteConfirmModal.jsx';

const AdminLeads = () => {
  const { searchQuery } = useOutletContext();

  // ================= STATE =================
  const [leads, setLeads] = useState([]); // Master List
  const [filteredLeads, setFilteredLeads] = useState([]); // View List
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

    // Add state for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // NEW: Counts for the dropdowns
  const [globalCounts, setGlobalCounts] = useState({ all: 0, mine: 0, unassigned: 0 });

  // Filters
  const [filters, setFilters] = useState({
    view: 'all', 
    status: 'all',
    inquiryType: 'all',
    priority: 'all',
    dateRange: 'all'
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0, new: 0, contacted: 0, inProgress: 0, closed: 0
  });

  // ================= INITIAL SETUP =================
  // Load admin info and team members on mount
  useEffect(() => {
    const admin = getCurrentAdmin();
    const role = getAdminRole();
    setCurrentAdmin(admin);
    setAdminRole(role);
    
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const members = await getPublicTeamMembers();
      setTeamMembers(members.filter(m => m.active));
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  // ================= NEW LOGIC STARTS HERE =================

  // 1. Fetch ALL data once when the component mounts (or admin changes)
  useEffect(() => {
    fetchAllData();
  }, [currentAdmin]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Force 'all' to bypass backend bugs and get everything
      const data = await getAllLeads({ view: 'all' });
      
      setLeads(data);
      setFilteredLeads(data);
      calculateGlobalCounts(data);
      calculateLocalStats(data);
      
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  // 2. Re-run filters whenever the user changes settings
  useEffect(() => {
    applyFilters();
  }, [filters, leads, searchQuery]);

const applyFilters = () => {
    if (leads.length === 0) return;

    let result = [...leads]; // Start with Master List

    // =========================================================
    // 1. FILTER BY VIEW (My Leads / Unassigned / Specific Worker)
    // =========================================================
    
    // Case A: My Leads
    if (filters.view === 'mine') {
      const myId = currentAdmin?.workerProfile?._id;
      if (myId) {
        result = result.filter(l => l.assignedTo?._id === myId);
      } else {
        result = [];
      }
    } 
    // Case B: Unassigned
    else if (filters.view === 'unassigned') {
      result = result.filter(l => !l.assignedTo || !l.assignedTo._id);
    } 
    // Case C: Specific Worker (Superadmin Selection)
    // If it's not 'all', 'mine', or 'unassigned', it MUST be a Worker ID
    else if (filters.view !== 'all') {
      const targetWorkerId = filters.view;
      result = result.filter(l => l.assignedTo?._id === targetWorkerId);
    }

    // =========================================================
    // 2. OTHER FILTERS
    // =========================================================

    // Filter by Status
    if (filters.status !== 'all') {
      result = result.filter(l => l.status === filters.status);
    }

    // Filter by Type
    if (filters.inquiryType !== 'all') {
      result = result.filter(l => l.inquiryType === filters.inquiryType);
    }

    // Filter by Priority
    if (filters.priority !== 'all') {
      result = result.filter(l => l.priority === filters.priority);
    }

    // Filter by Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead => 
        lead.fullName.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.phoneNumber.includes(query) ||
        lead.message.toLowerCase().includes(query)
      );
    }

    // Update UI and Stats
    setFilteredLeads(result);
    calculateLocalStats(result);
  };
  // 3. Helper Functions
  const calculateLocalStats = (currentLeads) => {
    setStats({
      total: currentLeads.length,
      new: currentLeads.filter(l => l.status === 'New').length,
      contacted: currentLeads.filter(l => l.status === 'Contacted').length,
      inProgress: currentLeads.filter(l => l.status === 'InProgress').length,
      closed: currentLeads.filter(l => l.status === 'Closed').length
    });
  };

  const calculateGlobalCounts = (allData) => {
    const myWorkerId = currentAdmin?.workerProfile?._id;
    setGlobalCounts({
      all: allData.length,
      mine: myWorkerId ? allData.filter(l => l.assignedTo?._id === myWorkerId).length : 0,
      unassigned: allData.filter(l => !l.assignedTo || !l.assignedTo._id).length
    });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleLeadUpdated = () => {
    fetchAllData(); // Reload everything on update
  };
  
  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowDetailsPanel(true);
  };

  const handleClosePanel = () => {
    setShowDetailsPanel(false);
    setSelectedLead(null);
  };

  const handleDeleteLead = async (leadId) => {


    try {
      await deleteLead(leadId);
      toast.success('Lead deleted successfully');
      
      // FIX: Call fetchAllData instead of loadLeads/loadStats
      setDeleteConfirm(null);
      fetchAllData();
      
      if (selectedLead?._id === leadId) {
        handleClosePanel();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete lead');
    }
  };

  // ================= UI HELPERS =================

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '🔴';
      case 'Contacted': return '🟡';
      case 'InProgress': return '🔵';
      case 'Closed': return '🟢';
      default: return '⚪';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const canEditLead = (lead) => {
    if (adminRole === 'superadmin') return true;
    
    // Permission Fix: Check worker profile ID
    const myWorkerId = currentAdmin?.workerProfile?._id;
    if (adminRole === 'admin' && lead.assignedTo?._id === myWorkerId) return true;
    
    return false;
  };

  const canDeleteLead = () => {
    return adminRole === 'superadmin';
  };

  if (loading) {
    return (
      <div className="admin-leads">
        <div className="leads-loading">
          <div className="spinner"></div>
          <p>Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-leads">
      {/* Header */}
      <div className="leads-header">
        <div>
          <h1 className="leads-title">Leads Management</h1>
          <p className="leads-subtitle">Manage and track all customer inquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="leads-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Leads</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">New</p>
            <p className="stat-value">{stats.new}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">In Progress</p>
            <p className="stat-value">{stats.contacted + stats.inProgress}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Closed</p>
            <p className="stat-value">{stats.closed}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="leads-filters">
        {/* View Filter */}
        <div className="filter-group">
          <label>View</label>
          <select 
            value={filters.view} 
            onChange={(e) => handleFilterChange('view', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Leads ({globalCounts.all})</option>
            
            {adminRole === 'admin' && (
              <option value="mine">My Leads ({globalCounts.mine})</option>
            )}
            
            <option value="unassigned">Unassigned ({globalCounts.unassigned})</option>
            
            {adminRole === 'superadmin' && teamMembers.length > 0 && (
              <>
                <option disabled>──────────</option>
                {teamMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.translations.en.name}'s Leads
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label>Status</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="New">🔴 New ({stats.new})</option>
            <option value="Contacted">🟡 Contacted ({stats.contacted})</option>
            <option value="InProgress">🔵 In Progress ({stats.inProgress})</option>
            <option value="Closed">🟢 Closed ({stats.closed})</option>
          </select>
        </div>

        {/* Inquiry Type Filter */}
        <div className="filter-group">
          <label>Type</label>
          <select 
            value={filters.inquiryType} 
            onChange={(e) => handleFilterChange('inquiryType', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="buying">Buying</option>
            <option value="selling">Selling</option>
            <option value="renting">Renting</option>
            <option value="land">Land</option>
            <option value="consulting">Consulting</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <label>Priority</label>
          <select 
            value={filters.priority} 
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="High">🔥 High</option>
            <option value="Medium">⭐ Medium</option>
            <option value="Low">🔻 Low</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button 
          className="btn-clear-filters"
          onClick={() => setFilters({ view: 'all', status: 'all', inquiryType: 'all', priority: 'all', dateRange: 'all' })}
        >
          Clear Filters
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="leads-table-container desktop-only">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-leads">
                  <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  <p>No leads found</p>
                </td>
              </tr>
            ) : (
              filteredLeads.map(lead => (
                <tr key={lead._id} className="lead-row">
                  <td>
                    <div className="lead-name">
                      <strong>{lead.fullName}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="lead-contact">
                      <div>{lead.email}</div>
                      <div className="phone">{lead.phoneNumber}</div>
                    </div>
                  </td>
                  <td>
                    <span className="inquiry-badge">{lead.inquiryType}</span>
                  </td>
                  <td>
                    {lead.assignedTo ? (
                      <span className="assigned-to">
                        {lead.assignedTo.translations.en.name}
                      </span>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                      {getStatusColor(lead.status)} {lead.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityBadge(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="date-cell">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-view"
                        onClick={() => handleViewLead(lead)}
                        title="View Details"
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {canDeleteLead() && (
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => setDeleteConfirm({id:lead._id ,name:lead.translations?.en?.name || lead.fullName})}
                          title="Delete Lead"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="leads-cards mobile-only">
        {filteredLeads.length === 0 ? (
          <div className="no-leads-card">
            <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            <p>No leads found</p>
          </div>
        ) : (
          filteredLeads.map(lead => (
            <div key={lead._id} className="lead-card" onClick={() => handleViewLead(lead)}>
              <div className="card-header">
                <div className="card-status">
                  <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                    {getStatusColor(lead.status)} {lead.status}
                  </span>
                  <span className={`priority-badge ${getPriorityBadge(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </div>
                <span className="card-date">{formatDate(lead.createdAt)}</span>
              </div>
              
              <h3 className="card-name">{lead.fullName}</h3>
              
              <div className="card-contact">
                <div className="contact-item">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {lead.email}
                </div>
                <div className="contact-item">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {lead.phoneNumber}
                </div>
              </div>
              
              <div className="card-info">
                <span className="inquiry-badge">{lead.inquiryType}</span>
                {lead.assignedTo ? (
                  <span className="assigned-to">👤 {lead.assignedTo.translations.en.name}</span>
                ) : (
                  <span className="unassigned">Unassigned</span>
                )}
              </div>
              
              <div className="card-actions">
                <button 
                  className="btn-card-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewLead(lead);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lead Details Side Panel (Desktop) or Full Page (Mobile) */}
      {showDetailsPanel && selectedLead && (
        <LeadDetailsPanel
          lead={selectedLead}
          onClose={handleClosePanel}
          onUpdate={handleLeadUpdated}
          teamMembers={teamMembers}
          canEdit={canEditLead(selectedLead)}
          canDelete={canDeleteLead()}
          adminRole={adminRole}
        />
      )}
            <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDeleteLead(deleteConfirm?.id)}
        title="Delete Lead"
        itemName={deleteConfirm?.name}
        itemType="lead"
      />
    </div>
  );
};

export default AdminLeads;