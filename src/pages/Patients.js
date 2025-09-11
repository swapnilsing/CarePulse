import React, { useEffect, useState } from 'react';

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch('/api/patients')
      .then((res) => res.json())
      .then(setPatients);
  }, []);

  return (
    <div>
      <h2>Patients</h2>
      <ul>
        {patients.map((p) => (
          <li key={p._id}>
            {p.name} - {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Patients;
