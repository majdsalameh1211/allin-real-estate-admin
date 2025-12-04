// src/layouts/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutAdmin, getCurrentAdmin, getMe,  } from '../../services/api'; // Import getCurrentAdmin
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminData, setAdminData] = useState(null); // Store full admin object

  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
    const fetchAdminData = async () => {
      // 1. Fast load
      const stored = getCurrentAdmin();
      if (stored) setAdminData(stored);

      // 2. Fresh load
      try {
        const freshData = await getMe();
        setAdminData(freshData);
      } catch (error) {
        console.error("Failed to refresh sidebar data");
      }
    };

    fetchAdminData();

    // 2. Load collapsed state
    const collapsed = localStorage.getItem('sidebarCollapsed');
    if (collapsed === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Search Scope Configuration
  const searchScope = {
    '/admin/projects': 'projects',
    '/admin/services': 'services',
    '/admin/testimonials': 'reviews',
    '/admin/courses': 'courses' // Added scope for courses
  };
  const currentScope = searchScope[location.pathname] || null;

  const getSearchPlaceholder = () => {
    switch (location.pathname) {
      case '/admin': return 'Search your profile...';
      case '/admin/projects': return 'Search projects...';
      case '/admin/services': return 'Search services...';
      case '/admin/testimonials': return 'Search reviews...';
      case '/admin/courses': return 'Search courses...'; // Added placeholder
      default: return 'Search...';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('workerProfile');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
  const closeSidebar = () => {
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Helper to get initials or avatar
const getAvatar = () => {
  // Check if linked worker exists and has an image
  if (adminData?.workerProfile?.image) {
    return (
      <img 
        src={adminData.workerProfile.image} 
        alt="Admin" 
        className="mini-avatar-img" 
      />
    );
  }
  
  // Fallback to initials if no image linked
  const initials = adminData ? `${adminData.firstName[0]}${adminData.lastName[0]}` : 'A';
  return <div className="mini-avatar-text">{initials}</div>;
};

  return (
    <div className="admin-layout">

      {/* --- MOBILE HEADER (Visible only on small screens) --- */}
      <div className="admin-mobile-header">
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="mobile-logo">
          <img src="/logo-optimized.png" alt="Logo" />
        </div>
        {/* Mobile Avatar (Top Right) */}
        <div className="mobile-user">
          {getAvatar()}
        </div>
      </div>

      {/* --- OVERLAY --- */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar}></div>

      {/* --- SIDEBAR --- */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* 1. Footer: User Info & Logout */}
        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="mini-avatar">
              {getAvatar()}
            </div>
            <div className="mini-user-info">
              <span className="mini-name">{adminData?.firstName} {adminData?.lastName}</span>
              <span className="mini-role">{adminData?.role}</span>
            </div>
          </div>

          <button
            className="footer-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>


        {/* 2. Navigation Links */}
        <nav className="sidebar-nav">

          {/* CHANGED: Dashboard -> Profile */}
          <Link
            to="/admin"
            className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <div className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className="nav-text">Profile</span>
            {sidebarCollapsed && <span className="nav-tooltip">Profile</span>}
          </Link>

          <Link
            to="/admin/leads"
            className={`nav-item ${isActive('/admin/leads') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <div className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <span className="nav-text">Leads</span>
            {sidebarCollapsed && <span className="nav-tooltip">Leads</span>}
          </Link>

          <Link
            to="/admin/projects"
            className={`nav-item ${isActive('/admin/projects') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <div className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="nav-text">Projects</span>
            {sidebarCollapsed && <span className="nav-tooltip">Projects</span>}
          </Link>

          <Link
            to="/admin/services"
            className={`nav-item ${isActive('/admin/services') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <div className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <span className="nav-text">Services</span>
            {sidebarCollapsed && <span className="nav-tooltip">Services</span>}
          </Link>

          {/* New Courses Link */}
          <Link
            to="/admin/courses"
            className={`nav-item ${isActive('/admin/courses') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <div className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <span className="nav-text">Courses</span>
            {sidebarCollapsed && <span className="nav-tooltip">Courses</span>}
          </Link>

          <Link
            to="/admin/testimonials"
            className={`nav-item ${isActive('/admin/testimonials') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <div className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span className="nav-text">Reviews</span>
            {sidebarCollapsed && <span className="nav-tooltip">Reviews</span>}
          </Link>

          {/* Superadmin Links */}
          {adminData?.role === 'superadmin' && (
            <Link
              to="/admin/users"
              className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <div className="nav-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="nav-text">Admins</span>
              {sidebarCollapsed && <span className="nav-tooltip">Admins</span>}
            </Link>
          )}

          <Link
            to="/admin/team"
            className={`nav-item ${isActive('/admin/team') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <div className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span className="nav-text">Team Members</span>
            {sidebarCollapsed && <span className="nav-tooltip">Team Members</span>}
          </Link>
        </nav>

        {/* 3. Header & Toggle */}
        <div className="sidebar-header">
          {/* Logo 
          <div className="logo-container">
            <img src="/logo-optimized.png" alt="ALL IN" className="sidebar-logo" />
          </div>

          */}

          {/* Collapse Button - Always on Top */}

          <button
            onClick={toggleCollapse}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
            style={{
              width: "100%",
              height: "50px",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",

              cursor: "pointer",
              color: "inherit",

              transition: "all 0.25s ease"
            }}

            // Hover effect
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}

            // Click animation
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                width: "22px",
                height: "22px",
                display: "block"
              }}
            >
              {sidebarCollapsed ? (
                <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
              ) : (
                <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
              )}
            </svg>
          </button>




        </div>


      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className={`admin-main ${sidebarCollapsed ? 'expanded' : ''}`}>

        {/* Global Search Bar */}
        {currentScope && (
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>
          </div>
        )}

        <Outlet context={{ searchQuery, scope: currentScope }} />
      </main>
    </div>
  );
};

export default AdminLayout;