import API from "../api";

function normalizeAppointment(dto) {
  return {
    id: Number(dto?.id || 0),
    appointmentDate: dto?.appointmentDate || "",
    startTime: dto?.startTime || "",
    endTime: dto?.endTime || "",
    veterinarianName: dto?.veterinarianName || "",
    appointmentType: dto?.appointmentType || "ONLINE",
    status: dto?.status || "AVAILABLE",
    userId: dto?.userId ?? null,
    petId: dto?.petId ?? null,
    createdAt: dto?.createdAt || "",
  };
}

export async function getAvailableAppointments(params = {}) {
  const response = await API.get("/appointments/available", { params });
  return Array.isArray(response.data) ? response.data.map(normalizeAppointment) : [];
}

export async function bookAppointment(appointmentId, petId) {
  const response = await API.post(`/appointments/${appointmentId}/book`, { petId });
  return normalizeAppointment(response.data);
}

export async function getMyAppointments() {
  const response = await API.get("/appointments/my");
  return Array.isArray(response.data) ? response.data.map(normalizeAppointment) : [];
}
