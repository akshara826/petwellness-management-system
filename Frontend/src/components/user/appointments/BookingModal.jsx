import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyPets } from "../../../api/petsApi";
import { bookAppointment } from "../../../api/services/appointmentService";
import { useToast } from "../../shared/Toast";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "-";
  const [hour, minute] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hour || 0), Number(minute || 0), 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

const TYPE_STYLES = {
  ONLINE: {
    card: "bg-[#D0F5EB]",
    badge: "bg-[#B6EEDC] text-[#1BAF82]",
    label: "🖥️ Online",
  },
  CLINIC: {
    card: "bg-[#DAEAF8]",
    badge: "bg-[#CBE0F6] text-[#1E6FD9]",
    label: "🏥 Clinic",
  },
};

export default function BookingModal({ appointment, isOpen, onClose, onBooked }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isOpen || !appointment) return;

    let active = true;
    setLoadingPets(true);
    setPets([]);
    setSelectedPetId(null);
    setSubmitAttempted(false);
    setSubmitError("");

    fetchMyPets()
      .then((data) => {
        if (active) setPets(data);
      })
      .catch((error) => {
        if (active) setSubmitError(error?.response?.data?.message || error?.message || "Failed to load pets");
      })
      .finally(() => {
        if (active) setLoadingPets(false);
      });

    return () => {
      active = false;
    };
  }, [appointment, isOpen]);

  const typeConfig = useMemo(
    () => TYPE_STYLES[appointment?.appointmentType] || TYPE_STYLES.ONLINE,
    [appointment?.appointmentType]
  );

  if (!isOpen || !appointment) return null;

  const handleConfirm = async () => {
    setSubmitAttempted(true);
    setSubmitError("");
    if (!selectedPetId) return;

    setIsBooking(true);
    try {
      const booked = await bookAppointment(appointment.id, selectedPetId);
      showToast("✓ Appointment booked successfully!", "success");
      onBooked?.(booked);
      onClose?.();
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-[#1A2332]/45 px-4 py-4 backdrop-blur-sm sm:items-center"
      onClick={isBooking ? undefined : onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-[20px] border border-[#E2EBF0] bg-white p-5 shadow-[0_20px_50px_rgba(26,35,50,0.18)] sm:max-h-[88vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[18px] font-extrabold text-[#1A2332]">Book Appointment</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EBF4F8] text-lg text-[#6B7A8D] transition hover:bg-[#FEE2E2] hover:text-[#F87171]"
          >
            ✕
          </button>
        </div>

        <div className={`mt-4 rounded-xl px-4 py-4 ${typeConfig.card}`}>
          <p className="text-sm font-semibold text-[#1A2332]">📅 {formatDate(appointment.appointmentDate)}</p>
          <p className="mt-1 text-sm text-[#1A2332]">🕐 {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}</p>
          <p className="mt-1 text-sm text-[#1A2332]">👨‍⚕️ Dr. {appointment.veterinarianName}</p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${typeConfig.badge}`}>
            {typeConfig.label}
          </span>
        </div>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7A8D]">Select Your Pet</p>

        {loadingPets ? (
          <div className="flex items-center justify-center py-10">
            <span className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-[#D0F5EB] border-t-[#2DD4A0]" />
          </div>
        ) : pets.length === 0 ? (
          <div className="mt-3 rounded-xl bg-[#FEE2E2] px-4 py-4 text-center">
            <p className="text-lg">🐾</p>
            <p className="mt-1 text-sm font-bold text-[#991B1B]">No pets found</p>
            <p className="mt-1 text-sm text-[#6B7A8D]">Please add a pet to your profile first</p>
            <button
              type="button"
              onClick={() => {
                onClose?.();
                navigate("/my-pets");
              }}
              className="mt-3 rounded-full bg-[#2DD4A0] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
            >
              Add a Pet
            </button>
          </div>
        ) : (
          <div className="mt-3 max-h-[200px] space-y-2 overflow-y-auto">
            {pets.map((pet) => {
              const active = selectedPetId === pet.id;
              return (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`relative flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    active ? "border-[#2DD4A0] bg-[#D0F5EB]" : "border-[#E2EBF0] bg-white hover:border-[#BFE7DB]"
                  }`}
                >
                  {pet.imageUrl ? (
                    <img src={pet.imageUrl} alt={pet.name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D0F5EB] text-sm">🐾</span>
                  )}
                  <div>
                    <p className="text-[13px] font-bold text-[#1A2332]">{pet.name}</p>
                    <p className="text-[11px] text-[#6B7A8D]">
                      {pet.species} · {pet.breed || "-"}
                    </p>
                  </div>
                  {active ? (
                    <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2DD4A0] text-[11px] font-bold text-white">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {submitAttempted && !selectedPetId && pets.length > 0 ? (
          <p className="mt-2 text-[11px] font-medium text-[#F87171]">Please select a pet to continue</p>
        ) : null}
        {submitError ? <p className="mt-2 text-[11px] font-medium text-[#F87171]">{submitError}</p> : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isBooking}
            className="rounded-full border border-[#E2EBF0] px-5 py-2.5 text-sm font-bold text-[#1A2332] transition hover:border-[#2DD4A0] hover:text-[#1BAF82] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isBooking || pets.length === 0}
            className="inline-flex items-center justify-center rounded-full bg-[#2DD4A0] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1BAF82] disabled:cursor-not-allowed disabled:bg-[#A8E8D5]"
          >
            {isBooking ? (
              <span className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Booking...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
