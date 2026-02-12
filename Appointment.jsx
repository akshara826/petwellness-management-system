import { useState } from 'react';
import API from '../api/api';

export default function Appointment() {
  const [appt, setAppt] = useState({ pet: '', vetName: '', date: '', type: 'clinic' });

  const bookAppt = async () => {
    await API.post('/appointments', appt);
    alert('Appointment booked!');
  };

  return (
    <div>
      <h2>Book Appointment</h2>
      <input placeholder="Pet ID" onChange={e => setAppt({ ...appt, pet: e.target.value })} />
      <input placeholder="Vet Name" onChange={e => setAppt({ ...appt, vetName: e.target.value })} />
      <input type="date" onChange={e => setAppt({ ...appt, date: e.target.value })} />
      <select onChange={e => setAppt({ ...appt, type: e.target.value })}>
        <option value="clinic">Clinic</option>
        <option value="online">Online</option>
      </select>
      <button onClick={bookAppt}>Book</button>
    </div>
  );
}
