import API from "../api";

export type AppointmentType = "ONLINE" | "CLINIC";
export type AppointmentStatus = "AVAILABLE" | "BOOKED";

export type AdminAppointment = {
  id: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  veterinarianName: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  userId: number | null;
  petId: number | null;
  createdAt: string;
};

export type AppointmentPayload = {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  veterinarianName: string;
  appointmentType: AppointmentType;
  status?: AppointmentStatus;
};

function normalizeAppointment(item: any): AdminAppointment {
  return {
    id: Number(item?.id || 0),
    appointmentDate: item?.appointmentDate || "",
    startTime: item?.startTime || "",
    endTime: item?.endTime || "",
    veterinarianName: item?.veterinarianName || "",
    appointmentType: item?.appointmentType || "ONLINE",
    status: item?.status || "AVAILABLE",
    userId: item?.userId ?? null,
    petId: item?.petId ?? null,
    createdAt: item?.createdAt || "",
  };
}

export async function getAllAppointments(): Promise<AdminAppointment[]> {
  const response = await API.get("/admin/appointments/all");
  return Array.isArray(response.data) ? response.data.map(normalizeAppointment) : [];
}

export async function getBookedAppointments(): Promise<AdminAppointment[]> {
  const response = await API.get("/admin/appointments/booked");
  return Array.isArray(response.data) ? response.data.map(normalizeAppointment) : [];
}

export async function createAppointment(data: AppointmentPayload): Promise<AdminAppointment> {
  const response = await API.post("/admin/appointments/create", data);
  return normalizeAppointment(response.data);
}

export async function updateAppointment(id: number | string, data: AppointmentPayload): Promise<AdminAppointment> {
  const response = await API.patch(`/admin/appointments/update/${id}`, data);
  return normalizeAppointment(response.data);
}

export async function deleteAppointment(id: number | string): Promise<string> {
  const response = await API.delete(`/admin/appointments/delete/${id}`);
  return response.data;
}
