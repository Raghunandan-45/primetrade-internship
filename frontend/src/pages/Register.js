import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { extractError } from '../services/api';
import { saveSession } from '../services/auth';
import Notice from '../components/Notice';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError('');

    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      setError('Phone must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.phone) delete payload.phone;
      if (!payload.address) delete payload.address;

      const { data } = await api.post('/auth/register', payload);
      saveSession(data.data);
      setSuccess('Registered successfully — redirecting...');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card">
        <div className="card-header"><h2>Create account</h2></div>
        <p className="muted">
          New accounts are always created as <strong>USER</strong>. Admin accounts are pre-seeded for reviewers.
        </p>
        <Notice type="success" message={success} />
        <Notice type="error" message={error} />
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={update('name')} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update('password')} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Phone (optional, 10 digits)</label>
            <input
              value={form.phone}
              onChange={update('phone')}
              pattern="\d{10}"
              maxLength={10}
              placeholder="9876543210"
            />
          </div>
          <div className="form-group">
            <label>Address (optional)</label>
            <input value={form.address} onChange={update('address')} />
          </div>
          <button className="btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Register'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 14 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
