// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  /*
  headers: {
    'Content-Type': 'application/json'
  }
  */
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("adminToken");


  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});




// ==================== ADMINS ====================

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {

      console.warn("🔐 Token invalid or expired. Logging out...");

      // Clear ALL auth data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('workerProfile');

      // Redirect safely
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);


// Function to set the auth token for all subsequent requests
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// ==================== ADMIN AUTH & MANAGEMENT ====================
/**
 * Get worker profile if admin is linked to one
 */
export const getWorkerProfile = () => {
  const workerProfile = localStorage.getItem('workerProfile');
  return workerProfile ? JSON.parse(workerProfile) : null;
};

/**
 * Check if current admin has a worker profile
 */
export const hasWorkerProfile = () => {
  return !!localStorage.getItem('workerProfile');
};

/**
 * Log in an admin user.
 * @param {string} email
 * @param {string} password
 */
export const adminLogin = async (email, password) => {
  try {
    const response = await api.post('/admin/login', { email, password });
    const { token, admin } = response.data;

    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminRole', admin.role);
    localStorage.setItem('adminUser', JSON.stringify(admin));

    // 🆕 Store worker profile separately for easy access
    if (admin.workerProfile) {
      localStorage.setItem('workerProfile', JSON.stringify(admin.workerProfile));
    } else {
      localStorage.removeItem('workerProfile'); // Clear if no worker linked
    }

    setAuthToken(token);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};
// 🆕 ADD THIS HELPER FUNCTION
/**
 * Get current admin user from localStorage
 */
export const getCurrentAdmin = () => {
  const adminUser = localStorage.getItem('adminUser');
  return adminUser ? JSON.parse(adminUser) : null;
};

// 🆕 ADD THIS HELPER FUNCTION
/**
 * Get admin role from localStorage
 */
export const getAdminRole = () => {
  return localStorage.getItem('adminRole');
};

// 🆕 ADD THIS HELPER FUNCTION
/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};

// 🆕 ADD THIS HELPER FUNCTION
/**
 * Logout and clear all auth data
 */
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminRole');
  localStorage.removeItem('workerProfile');
  localStorage.removeItem('adminUser');
  setAuthToken(null);
};

/**
 * Get all admin users (requires superadmin role)
 */
export const getAdminUsers = async () => {
  try {
    // Token check and set is handled automatically on instance creation/login
    const response = await api.get('/admin/users');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

// 🆕 ADD THIS FUNCTION
/**
 * Get a single admin user by ID (requires superadmin role)
 */
export const getAdminUser = async (id) => {
  try {
    const response = await api.get(`/admin/users/${id}`);  // ← Changed from /users/ to /user/
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load admin');
  }
};
/**
 * Create a new admin user (requires superadmin role)
 */
export const createAdminUser = async (userData) => {
  try {
    // 🔍 DEBUG: Check authentication
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');

    console.log('🔍 Creating admin user...');
    console.log('   Token exists:', !!token);
    console.log('   Current role:', role);
    console.log('   Data to send:', userData);

    const response = await api.post('/admin/users', userData);

    console.log('✅ Admin created successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);

    if (error.response) {
      // Server responded with error
      console.error('   Status:', error.response.status);
      console.error('   Error data:', error.response.data);

      // Throw a user-friendly error
      const errorMessage = error.response.data?.error ||
        error.response.data?.message ||
        'Failed to create admin user';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request made but no response
      console.error('   No response from server');
      throw new Error('No response from server. Is the backend running?');
    } else {
      // Something else happened
      console.error('   Error:', error.message);
      throw error;
    }
  }
};

/**
 * Update an existing admin user (requires superadmin role)
 */
export const updateAdminUser = async (id, userData) => {
  try {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating admin user:', error);
    throw error;
  }
};

/**
 * Delete an admin user (requires superadmin role)
 */
export const deleteAdminUser = async (id) => {
  try {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin user:', error);
    throw error;
  }
};


// ==================== PROJECTS ====================

/**
 * Get all projects
 * @param {string} lang - Language code (en, ar, he)
 * @param {string} type - Filter by type (all, forSale, forRent, sold)
 * @param {boolean} featured - Filter featured projects only
 */
export const getProjects = async (lang = 'en', type = 'all', featured = null) => {
  try {
    const params = { lang };
    if (type !== 'all') params.type = type;
    if (featured) params.featured = 'true';

    const response = await api.get('/projects', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

/**
 * Get single project by ID
 * @param {string} id - Project ID
 * @param {string} lang - Language code
 */
export const getProjectById = async (id, lang = 'en') => {
  try {
    const response = await api.get(`/projects/${id}`, {
      params: { lang }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};


// ==================== ADMIN PROJECTS ====================

/**
 * Create new project with file uploads
 */
export const createProject = async (formData) => {
  try {
    const response = await api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create project');
  }
};

/**
 * Update project with file uploads
 */
export const updateProject = async (id, formData) => {
  try {
    const response = await api.put(`/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update project');
  }
};

/**
 * Delete project
 * @param {string} id - Project ID
 * @param {boolean} permanent - Hard delete (true) or soft delete (false)
 */
export const deleteProject = async (id, permanent = false) => {
  try {
    const response = await api.delete(`/projects/${id}`, {
      params: { permanent: permanent.toString() }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete project');
  }
};

/**
 * Get project for editing (includes all translations)
 */
export const getProjectForEdit = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`, {
      params: { includeAllTranslations: 'true' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load project');
  }
};

// ==================== SERVICES ====================

/**
 * Get all services
 * @param {string} lang - Language code (en, ar, he)
 */
export const getServices = async (lang = 'en') => {
  try {
    const response = await api.get('/services', {
      params: { lang }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

/**
 * Get single service by ID
 * @param {string} id - Service ID
 * @param {string} lang - Language code
 */
export const getServiceById = async (id, lang = 'en') => {
  try {
    const response = await api.get(`/services/${id}`, {
      params: { lang }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};


// ==================== ADMIN - SERVICES ====================

/**
 * Create service with image upload
 */
export const createService = async (formData) => {
  try {
    const response = await api.post('/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create service');
  }
};

/**
 * Update service with image upload
 */
export const updateService = async (id, formData) => {
  try {
    const response = await api.put(`/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update service');
  }
};

/**
 * Delete service
 */
export const deleteService = async (id) => {
  try {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete service');
  }
};


// ==================== TESTIMONIALS (from backend later) ====================


/**
 * Get all testimonials
 * @param {string} lang - Language code (en, ar, he)
 * @param {boolean} featured - Filter featured testimonials only
 */
export const getTestimonials = async (lang = 'en', featured = null) => {
  try {
    const params = { lang };
    if (featured) params.featured = 'true';

    const response = await api.get('/testimonials', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
};

/**
 * Get single testimonial by ID
 * @param {string} id - Testimonial ID
 * @param {string} lang - Language code
 */
export const getTestimonialById = async (id, lang = 'en') => {
  try {
    const response = await api.get(`/testimonials/${id}`, {
      params: { lang }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    throw error;
  }
};


// admin

// Set initial token if it exists on page load/refresh
const initialToken = localStorage.getItem('adminToken');
if (initialToken) {
  setAuthToken(initialToken);
}


// frontend/src/services/api.js
// Add these functions to your existing api.js file

// ==================== TEAM MEMBERS ====================

export const getPublicTeamMembers = async (lang = 'en', featured = false) => {
  try {
    const params = new URLSearchParams();
    params.append('lang', lang);
    if (featured) params.append('featured', 'true');

    const response = await api.get(`/team?${params}`);
    // Backend returns array directly, not wrapped in data.data
    return response.data || [];
  } catch (error) {
    console.error('Error fetching public team members:', error);
    throw new Error(error.response?.data?.error || 'Failed to load team members');
  }
};

/**
 * Get current logged in admin details from server (Fresh Data)
 */
export const getMe = async () => {
  try {
    const response = await api.get('/admin/me');

    // Update local storage with fresh data if successful
    if (response.data.admin) {
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));

      // Update worker profile storage too
      if (response.data.admin.workerProfile) {
        localStorage.setItem('workerProfile', JSON.stringify(response.data.admin.workerProfile));
      } else {
        localStorage.removeItem('workerProfile');
      }
    }

    return response.data.admin;
  } catch (error) {
    console.error('Error fetching current admin:', error);
    throw error;
  }
};

/**
 * Get single team member by ID (Public)
 */
export const getTeamMember = async (id, lang = 'en') => {
  try {
    const response = await api.get(`/team/${id}?lang=${lang}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load team member');
  }
};

// ==================== ADMIN - TEAM MEMBERS ====================

/**
 * Get all team members for admin (includes inactive)
 */
export const getAllTeamMembers = async () => {
  try {
    const response = await api.get('/team/admin/all');
    // Backend returns array directly, not wrapped in data.data
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load team members');
  }
};
/**
 * Get single team member (full data) for admin
 */
export const getAdminTeamMember = async (id) => {
  try {
    const response = await api.get(`/team/admin/${id}`);
    // Backend returns member directly, not wrapped in data.data
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load team member');
  }
};

/**
 * Create new team member with file upload support
 * @param {FormData} formData - FormData object containing team member data and image file
 */
export const createTeamMember = async (formData) => {
  try {
    const response = await api.post('/team', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create team member');
  }
};

/**
 * Update team member with file upload support
 * @param {string} id - Team member ID
 * @param {FormData} formData - FormData object containing updated data and optional new image
 */
export const updateTeamMember = async (id, formData) => {
  try {
    const response = await api.put(`/team/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update team member');
  }
};

/**
 * Delete team member
 */
export const deleteTeamMember = async (id) => {
  try {
    const response = await api.delete(`/team/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete team member');
  }
};


// ==================== LEADS ====================

/**
 * Submit lead from contact form (PUBLIC)
 */
export const submitLead = async (leadData) => {
  try {
    const response = await api.post('/leads', leadData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to submit message');
  }
};

/**
 * Get all leads for admin
 */
export const getAllLeads = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.view) params.append('view', filters.view);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.inquiryType && filters.inquiryType !== 'all') params.append('inquiryType', filters.inquiryType);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/leads/admin/all?${params}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load leads');
  }
};

/**
 * Get lead statistics
 */
export const getLeadStats = async (view = 'all') => {
  try {
    const response = await api.get(`/leads/admin/stats?view=${view}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load statistics');
  }
};

/**
 * Get single lead by ID
 */
export const getLead = async (id) => {
  try {
    const response = await api.get(`/leads/admin/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load lead');
  }
};

/**
 * Create new lead manually (Superadmin only)
 */
export const createLead = async (leadData) => {
  try {
    const response = await api.post('/leads/admin/create', leadData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create lead');
  }
};

/**
 * Update lead
 */
export const updateLead = async (id, leadData) => {
  try {
    const response = await api.put(`/leads/admin/${id}`, leadData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update lead');
  }
};

/**
 * Delete lead (Superadmin only)
 */
export const deleteLead = async (id) => {
  try {
    const response = await api.delete(`/leads/admin/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete lead');
  }
};

/**
 * Assign/Reassign lead to team member (Superadmin only)
 */
export const assignLead = async (id, teamMemberId) => {
  try {
    const response = await api.patch(`/leads/admin/${id}/assign`, { assignedTo: teamMemberId });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to assign lead');
  }
};

/**
 * Mark lead as contacted
 */
export const markLeadAsContacted = async (id) => {
  try {
    const response = await api.patch(`/leads/admin/${id}/contact`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update lead');
  }
};

/**
 * Close lead
 */
export const closeLead = async (id) => {
  try {
    const response = await api.patch(`/leads/admin/${id}/close`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to close lead');
  }
};



// ==================== COURSES ====================

/**
 * Get all active courses (Public)
 * @param {string} lang - Language code (en, ar, he)
 * @param {number} limit - Optional limit
 */
export const getCourses = async (lang = 'en', limit = null) => {
  try {
    const params = { lang };
    if (limit) params.limit = limit;

    const response = await api.get('/courses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

/**
 * Get single course by ID (Public)
 * @param {string} id - Course ID
 * @param {string} lang - Language code
 */
export const getCourseById = async (id, lang = 'en') => {
  try {
    const response = await api.get(`/courses/${id}`, { params: { lang } });
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

// ==================== ADMIN - COURSES ====================

/**
 * Create new course with image upload (Admin)
 * @param {FormData} formData
 */
export const createCourse = async (formData) => {
  try {
    console.log('🌐 API - createCourse called');
    console.log('   - Sending POST to /courses');
    console.log('   - FormData contents:');
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

    // ✅ ADD THIS - Override Content-Type for FormData
    const response = await api.post('/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('   - Status:', error.response?.status);
    console.error('   - Data:', error.response?.data);
    throw new Error(error.response?.data?.error || 'Failed to create course');
  }
};
/**
 * Update course with image upload (Admin)
 * @param {string} id
 * @param {FormData} formData
 */
export const updateCourse = async (id, formData) => {
  try {
    console.log('🌐 API - updateCourse called');
    console.log('   - Course ID:', id);
    console.log('   - Sending PUT to /courses/' + id);
    console.log('   - FormData contents:');
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

    // ✅ ADD THIS - Override Content-Type for FormData
    const response = await api.put(`/courses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('   - Status:', error.response?.status);
    console.error('   - Data:', error.response?.data);
    throw new Error(error.response?.data?.error || 'Failed to update course');
  }
};

/**
 * Delete course (Admin)
 * @param {string} id
 */
export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete course');
  }
};

/**
 * Get course for editing (includes all translations)
 * @param {string} id
 */
export const getCourseForEdit = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`, {
      params: { includeAllTranslations: 'true' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load course');
  }
};


export default api;