import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { extractError } from '../services/api';
import { saveSession } from '../services/auth';
import Notice from '../components/Notice';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      saveSession(data.data);
      setSuccess('Logged in — redirecting...');
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card">
        <div className="card-header"><h2>Login</h2></div>
        <Notice type="success" message={success} />
        <Notice type="error" message={error} />
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update('password')} required />
          </div>
          <button className="btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 14 }}>
          New here? <Link to="/register">Register</Link>
        </p>
        <div className="card" style={{ marginTop: 18, background: '#fff', padding: 14 }}>
          <strong style={{ fontSize: 13 }}>Reviewer test accounts (after running seed):</strong>
          <ul style={{ fontSize: 13, margin: '8px 0 0', paddingLeft: 18, color: '#555' }}>
            <li><code>admin@vsms.dev</code> / <code>Admin@123</code> — ADMIN</li>
            <li><code>alice@vsms.dev</code> / <code>User@123</code> — USER (has vehicles + requests)</li>
            <li><code>bob@vsms.dev</code> / <code>User@123</code> — USER</li>
            <li><code>charlie@vsms.dev</code> / <code>User@123</code> — USER</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
