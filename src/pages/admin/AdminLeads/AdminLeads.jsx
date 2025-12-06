import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllLeads, 
  getAdminUsers, 
  getCurrentAdmin 
} from '../../../services/api';
import { 
  Search, 
  Filter, 
  Star, 
  Phone, 
  Mail, 
  Clock,
  X,
  ChevronDown
} from 'lucide-react';
import './AdminLeads.css';

const AdminLeads = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  
  // Data states
  const [allLeads, setAllLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [globalCounts, setGlobalCounts] = useState({
    all: 0,
    new: 0,
    contacted: 0,
    inProgress: 0,
    closed: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignedTo: '',
    startDate: '',
    endDate: ''
  });
  const [showMyLeadsOnly, setShowMyLeadsOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Mobile filter state
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate global counts (unaffected by filters)
  const calculateGlobalCounts = (leads) => {
    const counts = {
      all: leads.length,
      new: 0,
      contacted: 0,
      inProgress: 0,
      closed: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    leads.forEach(lead => {
      // Status counts
      if (lead.status === 'new') counts.new++;
      else if (lead.status === 'contacted') counts.contacted++;
      else if (lead.status === 'in-progress') counts.inProgress++;
      else if (lead.status === 'closed') counts.closed++;

      // Priority counts
      if (lead.priority === 'high') counts.high++;
      else if (lead.priority === 'medium') counts.medium++;
      else if (lead.priority === 'low') counts.low++;
    });

    return counts;
  };

  // Fetch data
  useEffect(() => {
    const storedAdmin = getCurrentAdmin();
    if (storedAdmin) {
      setAdmin(storedAdmin);
      if (storedAdmin.role === 'admin') {
        setShowMyLeadsOnly(true);
      }
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchTeamMembers();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getAllLeads();
      setAllLeads(data);
      setGlobalCounts(calculateGlobalCounts(data));
      setLoading(false);
    } catch (err) {
      setError('Failed to load leads');
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

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [allLeads, filters, showMyLeadsOnly, admin, activeTab]);

  const applyFilters = () => {
    let result = [...allLeads];

    // Admin role filter - show only assigned leads
    if (admin && admin.role === 'admin' && showMyLeadsOnly) {
      result = result.filter(lead => 
        lead.assignedTo && lead.assignedTo._id === admin._id
      );
    }

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter(lead => lead.status === activeTab);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(lead =>
        lead.fullName?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter(lead => lead.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      result = result.filter(lead => lead.priority === filters.priority);
    }

    // Assigned filter
    if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        result = result.filter(lead => !lead.assignedTo);
      } else {
        result = result.filter(lead => 
          lead.assignedTo && lead.assignedTo._id === filters.assignedTo
        );
      }
    }

    // Date range filter
    if (filters.startDate) {
      result = result.filter(lead => 
        new Date(lead.createdAt) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      result = result.filter(lead => 
        new Date(lead.createdAt) <= new Date(filters.endDate)
      );
    }

    setFilteredLeads(result);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      assignedTo: '',
      startDate: '',
      endDate: ''
    });
    setActiveTab('all');
    if (admin && admin.role === 'admin') {
      setShowMyLeadsOnly(true);
    } else {
      setShowMyLeadsOnly(false);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.assignedTo) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    // Don't count showMyLeadsOnly for admins as it's their default
    if (showMyLeadsOnly && admin?.role !== 'admin') count++;
    return count;
  };

  const handleCardClick = (leadId) => {
    navigate(`/admin/leads/${leadId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="leads-loading">
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leads-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-leads-page">
      {/* Header */}
      <div className="leads-header">
        <div>
          <h1>Lead Management</h1>
          <p>Manage and track your real estate inquiries</p>
        </div>
      </div>

      {/* Search Bar - Always visible */}
      <div className="leads-search-bar">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search leads by name, email, or phone..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="search-input"
        />
      </div>

      {/* Mobile Filter Toggle Button */}
      <button 
        className="mobile-filter-toggle"
        onClick={() => setFiltersExpanded(!filtersExpanded)}
      >
        <Filter size={18} />
        <span>Filters</span>
        {getActiveFilterCount() > 0 && (
          <span className="filter-badge">{getActiveFilterCount()}</span>
        )}
        <ChevronDown 
          size={16} 
          style={{ 
            transform: filtersExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }} 
        />
      </button>

      {/* Filters Section */}
      <div className={`leads-filters ${filtersExpanded ? 'expanded' : ''}`}>
        <div className="filter-dropdowns">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              className="filter-select"
            >
              <option value="">All Assignments</option>
              <option value="unassigned">Unassigned</option>
              {teamMembers.map((admin) => (
                <option
                  key={admin._id}
                  value={admin._id}
                >
                  {admin.firstName} {admin.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="filter-select"
            />
          </div>
        </div>

        {/* My Leads Toggle for Admins */}
        {admin && admin.role === 'admin' && (
          <label className="toggle-filter">
            <input
              type="checkbox"
              checked={showMyLeadsOnly}
              onChange={(e) => setShowMyLeadsOnly(e.target.checked)}
            />
            <span>My Leads Only</span>
          </label>
        )}

        {/* Clear Filters Button */}
        {getActiveFilterCount() > 0 && (
          <button className="btn-clear-filters" onClick={clearAllFilters}>
            <X size={16} />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        {[
          { key: 'all', label: 'All Leads', count: globalCounts.all },
          { key: 'new', label: 'New', count: globalCounts.new },
          { key: 'contacted', label: 'Contacted', count: globalCounts.contacted },
          { key: 'in-progress', label: 'In Progress', count: globalCounts.inProgress },
          { key: 'closed', label: 'Closed', count: globalCounts.closed }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`status-tab ${activeTab === tab.key ? 'active' : ''}`}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Lead Cards Grid */}
      <div className="leads-grid">
        {filteredLeads.length === 0 ? (
          <div className="no-leads">
            <p>No leads found matching your criteria</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead._id}
              className="lead-card"
              onClick={() => handleCardClick(lead._id)}
            >
              {/* Card Header */}
              <div className="card-header">
                <div className="card-header-left">
                  <h3>{lead.fullName}</h3>
                  <div className="card-badges">
                    <span className={`status-badge status-${lead.status}`}>
                      {lead.status.toUpperCase()}
                    </span>
                    {lead.priority === 'high' && (
                      <Star size={16} fill="#c19a5b" color="#c19a5b" />
                    )}
                  </div>
                </div>
                <div className="card-avatar">
                  {lead.fullName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Property Info */}
              <div className="card-property">
                <div className="property-label">Interested Property</div>
                <div className="property-name">{lead.propertyInterest || 'Not specified'}</div>
                {lead.budget && (
                  <div className="property-budget">₪{lead.budget.toLocaleString()}</div>
                )}
              </div>

              {/* Contact Info */}
              <div className="card-contact">
                <div className="contact-item">
                  <Mail size={14} />
                  <span>{lead.email}</span>
                </div>
                <div className="contact-item">
                  <Phone size={14} />
                  <span>{lead.phone}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="card-footer">
                <div className="card-date">
                  <Clock size={14} />
                  <span>{formatDate(lead.createdAt)}</span>
                </div>
                <button className="btn-view-details" onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(lead._id);
                }}>
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLeads;