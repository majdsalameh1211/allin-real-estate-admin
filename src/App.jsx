import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import ProtectedRoute from './utils/ProtectedRoute';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects/AdminProjects';
import AdminServices from './pages/admin/AdminServices/AdminServices';
import AdminTestimonials from './pages/admin/AdminTestimonials/AdminTestimonials';
import AdminUsers from './pages/admin/AdminManagement/AdminManagement';
import AdminForm from './pages/admin/AdminForm/AdminForm';
import AdminTeam from './pages/admin/AdminTeam/AdminTeam';
import TeamMemberForm from './pages/admin/TeamMemberForm/TeamMemberForm';
import AdminLeads from './pages/admin/AdminLeads/AdminLeads';
import AdminCourses from './pages/admin/AdminCourses/AdminCourses';
import CourseFormPage from './pages/admin/CourseForm/CourseFormPage';
import ProjectFormPage from './pages/admin/ProjectForm/ProjectFormPage';
import ServiceFormPage from './pages/admin/ServiceForm/ServiceFormPage';
import TestimonialFormPage from './pages/admin/TestimonialForm/TestimonialFormPage';
import LeadDetailsPanel from './pages/admin/AdminLeads/LeadDetailsPanel';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (

    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Area */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />

          {/* Projects */}
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/new" element={<ProjectFormPage />} />
          <Route path="projects/:id/edit" element={<ProjectFormPage />} />

          {/* Services */}
          <Route path="services" element={<AdminServices />} />
          <Route path="services/new" element={<ServiceFormPage />} />
          <Route path="services/:id/edit" element={<ServiceFormPage />} />

          {/* Courses */}
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/new" element={<CourseFormPage />} />
          <Route path="courses/:id/edit" element={<CourseFormPage />} />

          {/* Testimonials */}
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="testimonials/new" element={<TestimonialFormPage />} />
          <Route path="testimonials/:id/edit" element={<TestimonialFormPage />} />

          {/* Admin Users */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/new" element={<AdminForm />} />
          <Route path="users/edit/:id" element={<AdminForm />} />

          {/* Team */}
          <Route path="team" element={<AdminTeam />} />
          <Route path="team/new" element={<TeamMemberForm />} />
          <Route path="team/edit/:id" element={<TeamMemberForm />} />

          {/* Leads */}
          <Route path="leads" element={<AdminLeads />} />
          <Route path="leads/:id" element={<LeadDetailsPanel />} />

        </Route>
      </Routes>
    </>
  );
}

export default App;