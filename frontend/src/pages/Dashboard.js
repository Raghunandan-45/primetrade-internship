import React, { useState } from 'react';
import VehicleSection from '../components/VehicleSection';
import ServiceRequestSection from '../components/ServiceRequestSection';
import { getUser } from '../services/auth';

export default function Dashboard() {
  const user = getUser();
  const [vehicles, setVehicles] = useState([]);

  return (
    <div className="container">
      <h1 style={{ marginBottom: 4 }}>Welcome, {user?.name}</h1>
      <p className="muted" style={{ marginBottom: 22 }}>
        Logged in as <strong>{user?.role}</strong>
      </p>
      {user?.role !== 'ADMIN' && <VehicleSection onVehiclesChange={setVehicles} />}
      <ServiceRequestSection vehicles={vehicles} />
    </div>
  );
}
