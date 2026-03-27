import API from "./api";

function resolveMediaUrl(rawUrl) {
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith("blob:") || rawUrl.startsWith("data:")) {
    return rawUrl;
  }

  const baseUrl = String(API.defaults.baseURL || "");
  const apiRoot = baseUrl.replace(/\/api\/?$/, "");
  if (rawUrl.startsWith("/")) {
    return `${apiRoot}${rawUrl}`;
  }
  return rawUrl;
}

function normalizeVaccinationStatus(rawStatus, nextDueDate) {
  const status = String(rawStatus || "").toUpperCase();
  if (status === "COMPLETED") return "done";
  if (status === "OVERDUE") return "overdue";
  if (status === "UPCOMING") {
    if (!nextDueDate) return "upcoming";
    const due = new Date(nextDueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return "soon";
    return "upcoming";
  }
  return "upcoming";
}

export function mapPetResponse(dto) {
  return {
    id: dto.id,
    name: dto.name || "",
    species: dto.species || "",
    breed: dto.breed || "-",
    gender: dto.gender || "",
    dateOfBirth: dto.dateOfBirth || "",
    weight: dto.weight ? Number(dto.weight) : 0,
    imageUrl: resolveMediaUrl(dto.imageUrl),
    createdAt: dto.createdAt || "",
    colorClass: "c1",
    status: "healthy",
    statusLabel: "✓ Healthy",
    vetVisits: 0,
    vaccines: 0,
    orders: 0,
    lastVisit: "No record",
    nextCheckup: "Not scheduled",
    vaccinations: [],
    appointments: [],
    medicalHistory: [],
  };
}

export function mapMedicalHistoryResponse(dto) {
  return {
    id: dto.id,
    conditionName: dto.conditionName || "",
    diagnosisDate: dto.diagnosisDate || "",
    notes: dto.notes || "",
    visitDate: dto.visitDate || "",
    doctorName: dto.doctorName || "",
    clinicName: dto.clinicName || "",
    symptoms: dto.symptoms || "",
    diagnosis: dto.diagnosis || "",
    treatment: dto.treatment || "",
    medication: dto.medication || "",
    weight: dto.weight ? Number(dto.weight) : null,
    nextVisitDate: dto.nextVisitDate || "",
    prescriptionFile: dto.prescriptionFile || "",
  };
}

export function mapVaccinationResponse(dto) {
  return {
    id: dto.id,
    name: dto.vaccineName || "",
    date: dto.vaccinationDate || "",
    nextDueDate: dto.nextDueDate || null,
    doseNumber: dto.doseNumber ? Number(dto.doseNumber) : 1,
    doctor: dto.veterinarianName || "",
    clinic: "",
    notes: dto.notes || "",
    status: normalizeVaccinationStatus(dto.status, dto.nextDueDate),
    prescriptionFile: dto.prescriptionFile || "",
  };
}

export async function fetchMyPets() {
  const response = await API.get("/pets/me");
  return response.data.map(mapPetResponse);
}

export async function createPet(payload) {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("species", payload.species);
  formData.append("breed", payload.breed || "");
  formData.append("gender", payload.gender);
  formData.append("dateOfBirth", payload.dateOfBirth);
  if (payload.weight !== undefined && payload.weight !== null && payload.weight !== "") {
    formData.append("weight", String(payload.weight));
  }
  formData.append("image", payload.image);

  const response = await API.post("/pets/add", formData);
  return mapPetResponse(response.data);
}

export async function updatePet(petId, payload) {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("species", payload.species);
  formData.append("breed", payload.breed || "");
  formData.append("gender", payload.gender);
  formData.append("dateOfBirth", payload.dateOfBirth);
  if (payload.weight !== undefined && payload.weight !== null && payload.weight !== "") {
    formData.append("weight", String(payload.weight));
  }
  if (payload.image) formData.append("image", payload.image);

  const response = await API.patch(`/pets/Edit/${petId}`, formData);
  return mapPetResponse(response.data);
}

export async function removePet(petId) {
  await API.delete(`/pets/delete/${petId}`);
}

export async function fetchPetMedicalHistory(petId) {
  const response = await API.get(`/medical-history/pet/${petId}`, {
    params: { offset: 0, limit: 50 },
  });
  return response.data.map(mapMedicalHistoryResponse);
}

export async function addMedicalHistoryRecord(petId, payload) {
  if (payload?.isEditing && payload?.editId) {
    const formData = new FormData();
    formData.append("visitDate", payload.visitDate);
    formData.append("doctorName", payload.doctorName);
    formData.append("clinicName", payload.clinicName || "");
    formData.append("symptoms", payload.symptoms);
    formData.append("diagnosis", payload.diagnosis);
    formData.append("treatment", payload.treatment);
    formData.append("medication", payload.medication || "");
    formData.append("weight", String(payload.weight));
    if (payload.nextVisitDate) formData.append("nextVisitDate", payload.nextVisitDate);
    if (payload.prescriptionFile) formData.append("prescriptionFile", payload.prescriptionFile);

    const response = await updateMedicalHistory(payload.editId, formData);
    return response.data;
  }

  const formData = new FormData();
  formData.append("visitDate", payload.visitDate);
  formData.append("doctorName", payload.doctorName);
  formData.append("clinicName", payload.clinicName || "");
  formData.append("symptoms", payload.symptoms);
  formData.append("diagnosis", payload.diagnosis);
  formData.append("treatment", payload.treatment);
  formData.append("medication", payload.medication || "");
  formData.append("weight", String(payload.weight));
  formData.append("prescriptionFile", payload.prescriptionFile);
  if (payload.nextVisitDate) formData.append("nextVisitDate", payload.nextVisitDate);

  const response = await API.post(`/medical-history/pet/add/${petId}`, formData);
  return mapMedicalHistoryResponse(response.data);
}

export async function deleteMedicalHistoryRecord(medicalHistoryId) {
  await API.delete(`/medical-history/delete/${medicalHistoryId}`);
}

export async function fetchPetVaccinations(petId) {
  const response = await API.get(`/vaccinations/pet/${petId}`, {
    params: { offset: 0, limit: 50 },
  });
  return response.data.map(mapVaccinationResponse);
}

export async function addVaccinationRecord(petId, payload) {
  if (payload?.isEditing && payload?.editId) {
    const formData = new FormData();
    formData.append("vaccineName", payload.name);
    formData.append("vaccinationDate", payload.date);
    if (payload.nextDueDate) formData.append("nextDueDate", payload.nextDueDate);
    formData.append("doseNumber", String(payload.doseNumber || 1));
    formData.append("veterinarianName", payload.veterinarianName);
    formData.append("notes", payload.notes || "");
    if (payload.prescriptionFile) formData.append("prescriptionFile", payload.prescriptionFile);

    const response = await updateVaccination(payload.editId, formData);
    return response.data;
  }

  const formData = new FormData();
  formData.append("vaccineName", payload.name);
  formData.append("vaccinationDate", payload.date);
  if (payload.nextDueDate) formData.append("nextDueDate", payload.nextDueDate);
  formData.append("doseNumber", String(payload.doseNumber || 1));
  formData.append("veterinarianName", payload.veterinarianName);
  formData.append("notes", payload.notes || "");
  formData.append("prescriptionFile", payload.prescriptionFile);

  const response = await API.post(`/vaccinations/pet/add/${petId}`, formData);
  return mapVaccinationResponse(response.data);
}

export async function deleteVaccinationRecord(vaccinationId) {
  await API.delete(`/vaccinations/delete/${vaccinationId}`);
}

export const updateVaccination = (vaccinationId, data) =>
  API.patch(`/vaccinations/Edit/${vaccinationId}`, data);

export const updateMedicalHistory = (historyId, data) =>
  API.patch(`/medical-history/Edit/${historyId}`, data);

export async function downloadHealthReportPdf(petId) {
  const response = await API.get(`/reports/pet/${petId}/health-report`, {
    responseType: "blob",
  });
  return response.data;
}
