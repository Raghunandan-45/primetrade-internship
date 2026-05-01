import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated, clearSession } from '../services/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const authed = isAuthenticated();

  const logout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        VSMS
      </Link>
      <div className="links">
        {authed ? (
          <>
            <span className="muted" style={{ color: '#bbb' }}>
              {user?.name} · {user?.role}
            </span>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
