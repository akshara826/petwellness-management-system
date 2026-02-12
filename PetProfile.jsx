import React, { useState, useEffect } from 'react';
import API from '../api/api'; // adjust path if needed
import HealthChart from './HealthChart'; // adjust path if needed

export default function PetProfile() {
  // ✅ State declarations
  const [pets, setPets] = useState([]);
  const [newPet, setNewPet] = useState({ name: '', species: '', age: '' });

  // ✅ Fetch pets from API
  const fetchPets = async () => {
    try {
      const res = await API.get('/pets/USER_ID'); // replace USER_ID dynamically
      setPets(res.data);
    } catch (err) {
      console.error('Error fetching pets:', err);
    }
  };

  // ✅ Add new pet
  const addPet = async () => {
    try {
      await API.post('/pets', newPet);
      setNewPet({ name: '', species: '', age: '' }); // reset form
      fetchPets();
    } catch (err) {
      console.error('Error adding pet:', err);
    }
  };

  // ✅ Load pets when component mounts
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPets();
  }, []);

  return (
    <div>
      <h2>My Pets</h2>
      {pets.map(p => (
        <div key={p._id}>
          {p.name} ({p.species})
        </div>
      ))}

      <input
        placeholder="Name"
        value={newPet.name}
        onChange={e => setNewPet({ ...newPet, name: e.target.value })}
      />
      <input
        placeholder="Species"
        value={newPet.species}
        onChange={e => setNewPet({ ...newPet, species: e.target.value })}
      />
      <input
        placeholder="Age"
        value={newPet.age}
        onChange={e => setNewPet({ ...newPet, age: e.target.value })}
      />
      <button onClick={addPet}>Add Pet</button>

      {/* Example health chart */}
      <HealthChart
        data={[
          { date: '2026-01-01', weight: 10 },
          { date: '2026-02-01', weight: 12 }
        ]}
      />
    </div>
  );
}