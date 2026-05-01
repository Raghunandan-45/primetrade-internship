import React, { useEffect, useState } from 'react';
import api, { extractError } from '../services/api';
import Notice from './Notice';
import { getUser } from '../services/auth';

const SERVICE_TYPES = ['REGULAR', 'OIL', 'TIRE', 'BRAKE', 'BATTERY', 'ALIGNMENT', 'INSPECTION'];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const statusBadge = (status) => {
  if (status === 'PENDING') return 'badge badge-pending';
  if (status === 'IN_PROGRESS') return 'badge badge-progress';
  return 'badge badge-completed';
};

export default function ServiceRequestSection({ vehicles }) {
  const user = getUser();
  const isAdmin = user?.role === 'ADMIN';
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    vehicleId: '', issueDescription: '', serviceType: 'REGULAR', scheduledDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/services');
      setRequests(data.data);
    } catch (err) {
      setError(extractError(err));
    }
  };

  useEffect(() => { load(); }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    try {
      const payload = {
        ...form,
        scheduledDate: new Date(form.scheduledDate).toISOString(),
      };
      await api.post('/services', payload);
      setSuccess('Service request created');
      setForm({ vehicleId: '', issueDescription: '', serviceType: 'REGULAR', scheduledDate: '' });
      await load();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setSuccess(''); setError('');
    try {
      await api.put(`/services/${id}`, { status });
      setSuccess('Status updated');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const remove = async (id) => {
    setSuccess(''); setError('');
    try {
      await api.delete(`/services/${id}`);
      setSuccess('Service request deleted');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="card">
      <div className="card-header"><h2>Service Requests</h2></div>
      <Notice type="success" message={success} />
      <Notice type="error" message={error} />

      {!isAdmin && (
        <form onSubmit={submit}>
          <div className="row">
            <div className="form-group">
              <label>Vehicle</label>
              <select value={form.vehicleId} onChange={update('vehicleId')} required>
                <option value="">-- select vehicle --</option>
                {vehicles?.map((v) => (
                  <option key={v.id} value={v.id}>{v.model} ({v.licensePlate})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Service type</label>
              <select value={form.serviceType} onChange={update('serviceType')}>
                {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Scheduled date</label>
              <input type="datetime-local" value={form.scheduledDate} onChange={update('scheduledDate')} required />
            </div>
          </div>
          <div className="form-group">
            <label>Issue description</label>
            <textarea rows="2" value={form.issueDescription} onChange={update('issueDescription')} required />
          </div>
          <button className="btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Create Service Request'}
          </button>
        </form>
      )}

      <div style={{ marginTop: 18 }}>
        {requests.length === 0 ? (
          <p className="muted">No service requests.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Issue</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.vehicle?.model} ({r.vehicle?.licensePlate})</td>
                  <td>{r.serviceType}</td>
                  <td style={{ maxWidth: 200 }}>{r.issueDescription}</td>
                  <td>{new Date(r.scheduledDate).toLocaleString()}</td>
                  <td><span className={statusBadge(r.status)}>{r.status}</span></td>
                  <td>
                    <div className="actions">
                      {isAdmin && (
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                      {(isAdmin || r.status === 'PENDING') && (
                        <button className="btn btn-danger" onClick={() => remove(r.id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
