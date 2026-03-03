import React, { useEffect, useState } from 'react';

const LOCAL_PETS_KEY = 'pet_profiles_local';
const EMPTY_FORM = {
  name: '',
  species: '',
  breed: '',
  age: '',
  gender: '',
  notes: '',
};

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];

function getPetId(pet) {
  return pet?._id ?? pet?.id;
}

function normalizePet(pet) {
  const id = getPetId(pet) || `local-${Date.now()}-${Math.random()}`;
  return {
    ...pet,
    _id: id,
    id,
    name: pet?.name ?? '',
    species: pet?.species ?? '',
    breed: pet?.breed ?? '',
    age: pet?.age ?? '',
    gender: pet?.gender ?? '',
    notes: pet?.notes ?? '',
  };
}

function readLocalPets() {
  try {
    const raw = localStorage.getItem(LOCAL_PETS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizePet) : [];
  } catch {
    return [];
  }
}

function writeLocalPets(nextPets) {
  localStorage.setItem(LOCAL_PETS_KEY, JSON.stringify(nextPets));
}

export default function PetProfile() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const [newPet, setNewPet] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [editPet, setEditPet] = useState(EMPTY_FORM);

  useEffect(() => {
    const localPets = readLocalPets();
    setPets(localPets);
    setLoading(false);
  }, []);

  const resetMessages = () => {
    setFormError('');
    setSuccess('');
  };

  const validate = (payload) => {
    if (!payload.name.trim()) return 'Pet name is required.';
    if (!payload.species.trim()) return 'Species is required.';
    if (!payload.age || Number(payload.age) < 0) return 'Age must be 0 or greater.';
    return '';
  };

  const mapPayload = (payload) => ({
    name: payload.name.trim(),
    species: payload.species.trim(),
    breed: payload.breed.trim(),
    age: Number(payload.age),
    gender: payload.gender.trim(),
    notes: payload.notes.trim(),
  });

  const handleAddPet = (event) => {
    event.preventDefault();
    resetMessages();

    const validationError = validate(newPet);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    const payload = mapPayload(newPet);
    const createdPet = normalizePet({ ...payload, _id: `local-${Date.now()}` });
    setPets((prev) => {
      const next = [createdPet, ...prev];
      writeLocalPets(next);
      return next;
    });
    setNewPet(EMPTY_FORM);
    setSuccess('Pet profile added successfully.');
    setSubmitting(false);
  };

  const startEdit = (pet) => {
    setEditId(getPetId(pet));
    setEditPet({
      name: pet.name ?? '',
      species: pet.species ?? '',
      breed: pet.breed ?? '',
      age: pet.age ?? '',
      gender: pet.gender ?? '',
      notes: pet.notes ?? '',
    });
    resetMessages();
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditPet(EMPTY_FORM);
  };

  const handleSaveEdit = (pet) => {
    resetMessages();

    const validationError = validate(editPet);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const petId = getPetId(pet);
    if (!petId) {
      setFormError('Cannot update this profile because the pet ID is missing.');
      return;
    }

    setSavingId(petId);
    const payload = mapPayload(editPet);
    const updated = normalizePet({ ...pet, ...payload, _id: petId });
    setPets((prev) => {
      const next = prev.map((item) => (getPetId(item) === petId ? updated : item));
      writeLocalPets(next);
      return next;
    });
    setEditId(null);
    setEditPet(EMPTY_FORM);
    setSuccess('Pet profile updated successfully.');
    setSavingId(null);
  };

  const handleDeletePet = (pet) => {
    const petId = getPetId(pet);
    if (!petId) {
      setFormError('Cannot delete this profile because the pet ID is missing.');
      return;
    }

    resetMessages();
    setDeletingId(petId);
    setPets((prev) => {
      const next = prev.filter((item) => getPetId(item) !== petId);
      writeLocalPets(next);
      return next;
    });
    if (editId === petId) cancelEdit();
    setSuccess('Pet profile removed successfully.');
    setDeletingId(null);
  };

  return (
    <div style={{ maxWidth: 980, margin: '24px auto', padding: '0 16px' }}>
      <h2 style={{ marginBottom: 8 }}>My Pet Profiles</h2>
      <p style={{ marginTop: 0, color: '#555' }}>Add and manage multiple pets from one page.</p>

      {formError ? <div style={{ color: '#b00020', marginBottom: 12 }}>{formError}</div> : null}
      {success ? <div style={{ color: '#0f7a2d', marginBottom: 12 }}>{success}</div> : null}

      <form
        onSubmit={handleAddPet}
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
          background: '#fafafa',
        }}
      >
        <input
          placeholder="Name"
          value={newPet.name}
          onChange={(e) => setNewPet((prev) => ({ ...prev, name: e.target.value }))}
        />

        <select
          value={newPet.species}
          onChange={(e) => setNewPet((prev) => ({ ...prev, species: e.target.value }))}
        >
          <option value="">Select species</option>
          {SPECIES_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          placeholder="Breed"
          value={newPet.breed}
          onChange={(e) => setNewPet((prev) => ({ ...prev, breed: e.target.value }))}
        />

        <input
          type="number"
          min="0"
          placeholder="Age"
          value={newPet.age}
          onChange={(e) => setNewPet((prev) => ({ ...prev, age: e.target.value }))}
        />

        <input
          placeholder="Gender"
          value={newPet.gender}
          onChange={(e) => setNewPet((prev) => ({ ...prev, gender: e.target.value }))}
        />

        <input
          placeholder="Notes"
          value={newPet.notes}
          onChange={(e) => setNewPet((prev) => ({ ...prev, notes: e.target.value }))}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Pet'}
        </button>
      </form>

      {loading ? (
        <div>Loading pet profiles...</div>
      ) : pets.length === 0 ? (
        <div>No pet profiles yet. Add your first pet above.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {pets.map((pet) => {
            const petId = getPetId(pet);
            const isEditing = editId === petId;

            return (
              <div
                key={petId || `${pet.name}-${pet.species}`}
                style={{ border: '1px solid #ddd', borderRadius: 12, padding: 14, background: '#fff' }}
              >
                {isEditing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
                    <input
                      value={editPet.name}
                      onChange={(e) => setEditPet((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                    />
                    <input
                      value={editPet.species}
                      onChange={(e) => setEditPet((prev) => ({ ...prev, species: e.target.value }))}
                      placeholder="Species"
                    />
                    <input
                      value={editPet.breed}
                      onChange={(e) => setEditPet((prev) => ({ ...prev, breed: e.target.value }))}
                      placeholder="Breed"
                    />
                    <input
                      type="number"
                      min="0"
                      value={editPet.age}
                      onChange={(e) => setEditPet((prev) => ({ ...prev, age: e.target.value }))}
                      placeholder="Age"
                    />
                    <input
                      value={editPet.gender}
                      onChange={(e) => setEditPet((prev) => ({ ...prev, gender: e.target.value }))}
                      placeholder="Gender"
                    />
                    <input
                      value={editPet.notes}
                      onChange={(e) => setEditPet((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notes"
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(pet)}
                        disabled={savingId === petId}
                      >
                        {savingId === petId ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>{pet.name || 'Unnamed Pet'}</div>
                    <div>Species: {pet.species || '-'}</div>
                    <div>Breed: {pet.breed || '-'}</div>
                    <div>Age: {pet.age ?? '-'}</div>
                    <div>Gender: {pet.gender || '-'}</div>
                    <div>Notes: {pet.notes || '-'}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button type="button" onClick={() => startEdit(pet)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePet(pet)}
                        disabled={deletingId === petId}
                      >
                        {deletingId === petId ? 'Removing...' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
