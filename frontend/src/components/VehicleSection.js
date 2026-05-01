import React, { useEffect, useState } from 'react';
import api, { extractError } from '../services/api';
import Notice from './Notice';

export default function VehicleSection({ onVehiclesChange }) {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ model: '', year: '', licensePlate: '', vin: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data.data);
      onVehiclesChange?.(data.data);
    } catch (err) {
      setError(extractError(err));
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    try {
      await api.post('/vehicles', { ...form, year: Number(form.year) });
      setSuccess('Vehicle added');
      setForm({ model: '', year: '', licensePlate: '', vin: '' });
      await load();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setSuccess(''); setError('');
    try {
      await api.delete(`/vehicles/${id}`);
      setSuccess('Vehicle deleted');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="card">
      <div className="card-header"><h2>My Vehicles</h2></div>
      <Notice type="success" message={success} />
      <Notice type="error" message={error} />

      <form onSubmit={submit}>
        <div className="row">
          <div className="form-group">
            <label>Model</label>
            <input value={form.model} onChange={update('model')} required />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input type="number" value={form.year} onChange={update('year')} required />
          </div>
          <div className="form-group">
            <label>License plate (e.g. TN 20 BC 3424)</label>
            <input
              value={form.licensePlate}
              onChange={update('licensePlate')}
              placeholder="TN 20 BC 3424"
              required
            />
          </div>
          <div className="form-group">
            <label>VIN (17 chars, no I/O/Q)</label>
            <input
              value={form.vin}
              onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
              placeholder="1HGBH41JXMN109186"
              maxLength={17}
              required
            />
          </div>
        </div>
        <button className="btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add Vehicle'}
        </button>
      </form>

      <div style={{ marginTop: 18 }}>
        {vehicles.length === 0 ? (
          <p className="muted">No vehicles yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Model</th><th>Year</th><th>Plate</th><th>VIN</th><th></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>{v.model}</td>
                  <td>{v.year}</td>
                  <td>{v.licensePlate}</td>
                  <td>{v.vin}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => remove(v.id)}>Delete</button>
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
