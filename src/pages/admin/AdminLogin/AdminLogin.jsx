// src/pages/admin/AdminLogin.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminLogin , isAuthenticated} from '../../../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();

  // Check auth status immediately
  const isAuth = isAuthenticated();

  // Redirect if logged in
  useEffect(() => {
    if (isAuth) {
      navigate('/admin', { replace: true });
    }
  }, [isAuth, navigate]);

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔴 FIX: Stop rendering the form if redirecting
  if (isAuth) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      await adminLogin(credentials.email, credentials.password);
      toast.success('Login successful!');
      navigate('/admin');
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Invalid email or password';

      toast.error(message);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <img src="/logo-optimized.png" alt="ALL IN" className="admin-login-logo" />
          <h1>ALL IN</h1>
          <p>Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#d4af37'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="admin-login-footer">
          © 2024 ALL IN Real Estate. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;