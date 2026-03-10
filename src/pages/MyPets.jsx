import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopBar from "../components/dashboard/TopBar";
import AddPetCard from "../components/pets/AddPetCard";
import AddEditPetModal from "../components/pets/AddEditPetModal";
import DeleteConfirmModal from "../components/pets/DeleteConfirmModal";
import FilterTabs from "../components/pets/FilterTabs";
import MedicalHistoryModal from "../components/pets/MedicalHistoryModal";
import PetCard from "../components/pets/PetCard";
import PetDetailPanel from "../components/pets/PetDetailPanel";
import VaccinationModal from "../components/pets/VaccinationModal";
import {
  addMedicalHistoryRecord,
  addVaccinationRecord,
  createPet,
  deleteMedicalHistoryRecord,
  deleteVaccinationRecord,
  downloadHealthReportPdf,
  fetchMyPets,
  fetchPetMedicalHistory,
  fetchPetVaccinations,
  removePet,
  updatePet,
} from "../api/petsApi";

const MAX_PETS = 5;
const colorCycle = ["c1", "c2", "c3", "c4", "c5"];

const navItems = [
  { label: "Dashboard", icon: "🏠", to: "/user-dashboard", section: "MAIN" },
  { label: "My Pets", icon: "🐶", to: "/pets", activeRoute: true, section: "MAIN" },
  { label: "Appointments", icon: "📅", to: "/user-dashboard", badge: "2", badgeTone: "teal", section: "MAIN" },
  { label: "Vaccinations", icon: "💉", to: "/user-dashboard", badge: "1", badgeTone: "red", section: "MAIN" },
  { label: "Marketplace", icon: "🛒", to: "/marketplace", section: "MORE" },
  { label: "My Orders", icon: "📦", to: "/user-dashboard", section: "MORE" },
  { label: "Health Records", icon: "📋", to: "/user-dashboard", section: "MORE" },
  { label: "Settings", icon: "⚙️", to: "/user-dashboard", section: "MORE" },
];

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return {};
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return {};
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
}

function getLoggedInName() {
  const payload = decodeJwtPayload(localStorage.getItem("token"));
  const candidates = [
    localStorage.getItem("userName"),
    payload?.fullName,
    payload?.name,
    payload?.firstName,
    payload?.username,
    payload?.sub,
    payload?.email,
  ];
  const chosen = candidates.find((value) => typeof value === "string" && value.trim());
  if (!chosen) return "Pet Parent";
  const clean = chosen.trim();
  return clean.includes("@") ? clean.split("@")[0] : clean;
}

function gradientClass(colorClass) {
  if (colorClass === "c1") return "bg-gradient-to-br from-app-teal-light to-[#A7EDD8]";
  if (colorClass === "c2") return "bg-gradient-to-br from-app-blue-light to-[#B8D9F5]";
  if (colorClass === "c3") return "bg-gradient-to-br from-app-red-light to-[#FECACA]";
  if (colorClass === "c4") return "bg-gradient-to-br from-app-yellow-light to-[#FDE68A]";
  return "bg-gradient-to-br from-app-purple-light to-[#D8B4FE]";
}

function normalizeStatusFromVaccinations(vaccinations) {
  if (vaccinations.some((item) => item.status === "overdue")) return { status: "attention", statusLabel: "⚠ Attention" };
  if (vaccinations.some((item) => item.status === "soon" || item.status === "upcoming")) return { status: "vaccine-due", statusLabel: "⚠ Vaccine Due" };
  return { status: "healthy", statusLabel: "✓ Healthy" };
}

function buildUiPet(basePet, index) {
  return {
    ...basePet,
    colorClass: basePet.colorClass || colorCycle[index % colorCycle.length],
    vetVisits: basePet.vetVisits ?? 0,
    vaccines: basePet.vaccines ?? 0,
    orders: basePet.orders ?? 0,
    lastVisit: basePet.lastVisit || "No record",
    nextCheckup: basePet.nextCheckup || "Not scheduled",
    vaccinations: basePet.vaccinations || [],
    medicalHistory: basePet.medicalHistory || [],
    appointments: basePet.appointments || [],
  };
}

export default function MyPets() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pets, setPets] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPets, setLoadingPets] = useState(true);
  const [pageError, setPageError] = useState("");

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [selectedPetForMedical, setSelectedPetForMedical] = useState(null);

  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);
  const [selectedPetForVaccination, setSelectedPetForVaccination] = useState(null);

  const [selectedPet, setSelectedPet] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [busyAction, setBusyAction] = useState(false);

  const ownerName = useMemo(() => getLoggedInName(), []);
  const owner = useMemo(
    () => ({
      name: ownerName,
      avatar: ownerName.charAt(0)?.toUpperCase() || "P",
    }),
    [ownerName]
  );

  const hydratePetDetails = useCallback(async (petId) => {
    const [medicalHistory, vaccinations] = await Promise.all([
      fetchPetMedicalHistory(petId),
      fetchPetVaccinations(petId),
    ]);

    const statusData = normalizeStatusFromVaccinations(vaccinations);
    const lastVisit = medicalHistory[0]?.visitDate || "No record";
    const nextCheckup = medicalHistory[0]?.nextVisitDate || "Not scheduled";

    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              medicalHistory,
              vaccinations,
              vetVisits: medicalHistory.length,
              vaccines: vaccinations.length,
              lastVisit,
              nextCheckup,
              ...statusData,
              _hydrated: true,
            }
          : pet
      )
    );
  }, []);

  const loadPets = useCallback(async () => {
    try {
      setLoadingPets(true);
      setPageError("");
      const basePets = await fetchMyPets();
      const uiPets = basePets.map((pet, index) => buildUiPet(pet, index));
      setPets(uiPets);
      await Promise.all(uiPets.map((pet) => hydratePetDetails(pet.id)));
    } catch (error) {
      setPageError(error?.response?.data?.message || "Failed to load pets. Please try again.");
    } finally {
      setLoadingPets(false);
    }
  }, [hydratePetDetails]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const petsWithUi = useMemo(
    () =>
      pets.map((pet) => ({
        ...pet,
        gradientClass: gradientClass(pet.colorClass),
      })),
    [pets]
  );

  const counts = useMemo(
    () => ({
      all: pets.length,
      dog: pets.filter((pet) => (pet.species || "").toLowerCase() === "dog").length,
      cat: pets.filter((pet) => (pet.species || "").toLowerCase() === "cat").length,
      other: pets.filter((pet) => !["dog", "cat"].includes((pet.species || "").toLowerCase())).length,
      due: pets.filter((pet) => pet.status === "vaccine-due" || pet.status === "attention").length,
    }),
    [pets]
  );

  const filteredPets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return petsWithUi
      .filter((pet) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "dog") return (pet.species || "").toLowerCase() === "dog";
        if (activeFilter === "cat") return (pet.species || "").toLowerCase() === "cat";
        if (activeFilter === "other") return !["dog", "cat"].includes((pet.species || "").toLowerCase());
        return pet.status === "vaccine-due" || pet.status === "attention";
      })
      .filter((pet) => (term ? `${pet.name} ${pet.species} ${pet.breed} ${pet.id}`.toLowerCase().includes(term) : true));
  }, [petsWithUi, activeFilter, searchTerm]);

  const canAddMore = pets.length < MAX_PETS;

  const openAddModal = () => {
    if (!canAddMore) return;
    setEditingPet(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (pet) => {
    setEditingPet(pet);
    setIsAddEditModalOpen(true);
  };

  const openMedicalHistoryModal = async (pet) => {
    setSelectedPetForMedical(pet);
    setIsMedicalModalOpen(true);
    if (!pet?._hydrated) {
      try {
        await hydratePetDetails(pet.id);
      } catch {
        // keep modal open even if hydration fails
      }
    }
  };

  const openVaccinationModal = async (pet) => {
    setSelectedPetForVaccination(pet);
    setIsVaccinationModalOpen(true);
    if (!pet?._hydrated) {
      try {
        await hydratePetDetails(pet.id);
      } catch {
        // keep modal open even if hydration fails
      }
    }
  };

  const openDetail = async (pet) => {
    setSelectedPet(pet);
    if (!pet?._hydrated) {
      try {
        await hydratePetDetails(pet.id);
      } catch {
        // panel can still open
      }
    }
  };

  const confirmDelete = (pet) => {
    setPetToDelete(pet);
    setDeleteModalOpen(true);
  };

  const handleSavePet = async (formData, imagePreview, fileObj) => {
    try {
      setBusyAction(true);
      if (editingPet) {
        const updated = await updatePet(editingPet.id, {
          name: formData.name.trim(),
          species: formData.species.trim(),
          breed: formData.breed.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          weight: formData.weight ? Number(formData.weight) : undefined,
          image: fileObj || null,
        });

        setPets((prev) =>
          prev.map((pet) =>
            pet.id === editingPet.id
              ? {
                  ...pet,
                  ...updated,
                  imageUrl: imagePreview || updated.imageUrl || pet.imageUrl,
                  dateOfBirth: formData.dateOfBirth || pet.dateOfBirth,
                  weight: formData.weight ? Number(formData.weight) : pet.weight,
                }
              : pet
          )
        );
      } else {
        const created = await createPet({
          name: formData.name.trim(),
          species: formData.species.trim(),
          breed: formData.breed.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          weight: formData.weight ? Number(formData.weight) : 0.1,
          image: fileObj,
        });
        const withUi = buildUiPet(created, pets.length);
        withUi.imageUrl = imagePreview || created.imageUrl;
        withUi.dateOfBirth = formData.dateOfBirth;
        setPets((prev) => [...prev, withUi]);
      }
      setIsAddEditModalOpen(false);
      setEditingPet(null);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save pet.");
    } finally {
      setBusyAction(false);
    }
  };

  const handleSaveMedicalRecord = async (petId, record) => {
    try {
      setBusyAction(true);
      await addMedicalHistoryRecord(petId, record);
      await hydratePetDetails(petId);
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save medical history record.");
      return false;
    } finally {
      setBusyAction(false);
    }
  };

  const handleSaveVaccination = async (petId, vaccination) => {
    try {
      setBusyAction(true);
      await addVaccinationRecord(petId, vaccination);
      await hydratePetDetails(petId);
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save vaccination record.");
      return false;
    } finally {
      setBusyAction(false);
    }
  };

  const handleDelete = async () => {
    if (!petToDelete) return;
    try {
      setBusyAction(true);
      await removePet(petToDelete.id);
      setPets((prev) => prev.filter((pet) => pet.id !== petToDelete.id));
      if (selectedPet?.id === petToDelete.id) setSelectedPet(null);
      setDeleteModalOpen(false);
      setPetToDelete(null);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete pet.");
    } finally {
      setBusyAction(false);
    }
  };

  const deleteMedicalRecord = async (petId, recordId) => {
    try {
      setBusyAction(true);
      await deleteMedicalHistoryRecord(recordId);
      await hydratePetDetails(petId);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete medical record.");
    } finally {
      setBusyAction(false);
    }
  };

  const deleteVaccination = async (petId, vaccinationId) => {
    try {
      setBusyAction(true);
      await deleteVaccinationRecord(vaccinationId);
      await hydratePetDetails(petId);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete vaccination record.");
    } finally {
      setBusyAction(false);
    }
  };

  const downloadHealthReport = async (pet) => {
    try {
      const blob = await downloadHealthReportPdf(pet.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pet.name.replace(/\s+/g, "-").toLowerCase()}-health-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to download health report.");
    }
  };

  const selectedPetLive = selectedPet ? petsWithUi.find((pet) => pet.id === selectedPet.id) || null : null;
  const selectedMedicalPetLive = selectedPetForMedical ? petsWithUi.find((pet) => pet.id === selectedPetForMedical.id) || null : null;
  const selectedVaccinationPetLive = selectedPetForVaccination ? petsWithUi.find((pet) => pet.id === selectedPetForVaccination.id) || null : null;
  const petToDeleteLive = petToDelete ? petsWithUi.find((pet) => pet.id === petToDelete.id) || null : null;

  return (
    <div className="min-h-screen bg-app-bg text-app-navy" style={{ fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif' }}>
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="px-4 pb-7 pt-5 md:ml-[260px] md:px-8 md:pb-8 md:pt-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar
            variant="pets"
            onOpenSidebar={() => setSidebarOpen(true)}
            petsSearchValue={searchTerm}
            onPetsSearchChange={setSearchTerm}
            onPrimaryAction={openAddModal}
            addDisabled={!canAddMore || busyAction}
            addTooltip={!canAddMore ? "Maximum 5 pets allowed" : ""}
          />

          {pageError ? (
            <div className="rounded-2xl border border-app-red bg-app-red-light px-4 py-3 text-sm font-semibold text-app-red">
              {pageError}
            </div>
          ) : null}

          <FilterTabs activeFilter={activeFilter} onChangeFilter={setActiveFilter} counts={counts} viewMode={viewMode} onChangeView={setViewMode} />

          {!canAddMore ? (
            <div className="rounded-2xl border border-app-yellow bg-app-yellow-light px-4 py-3 text-sm font-semibold text-[#92400E]">
              ⚠️ You've reached the maximum limit of 5 pets. Remove a pet profile to add a new one.
            </div>
          ) : null}

          {loadingPets ? (
            <div className="rounded-2xl border border-app-border bg-white px-4 py-10 text-center text-sm font-semibold text-app-slate">
              Loading pets...
            </div>
          ) : (
            <section className={viewMode === "grid" ? "grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]" : "grid grid-cols-1 gap-4"}>
              {filteredPets.map((pet, index) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  viewMode={viewMode}
                  index={index}
                  onOpen={() => openDetail(pet)}
                  onEdit={() => openEditModal(pet)}
                  onOpenMedical={() => openMedicalHistoryModal(pet)}
                  onOpenVaccination={() => openVaccinationModal(pet)}
                  onDelete={() => confirmDelete(pet)}
                  onDownloadReport={() => downloadHealthReport(pet)}
                />
              ))}
              {canAddMore ? <AddPetCard onClick={openAddModal} index={filteredPets.length} usedSlots={pets.length} /> : null}
            </section>
          )}
        </div>
      </main>

      <AddEditPetModal
        isOpen={isAddEditModalOpen}
        editingPet={editingPet}
        petsCount={pets.length}
        onClose={() => {
          if (busyAction) return;
          setIsAddEditModalOpen(false);
          setEditingPet(null);
        }}
        onSave={handleSavePet}
      />

      <MedicalHistoryModal
        isOpen={isMedicalModalOpen}
        pet={selectedMedicalPetLive}
        onClose={() => {
          if (busyAction) return;
          setIsMedicalModalOpen(false);
          setSelectedPetForMedical(null);
        }}
        onSaveRecord={handleSaveMedicalRecord}
        onDeleteRecord={deleteMedicalRecord}
      />

      <VaccinationModal
        isOpen={isVaccinationModalOpen}
        pet={selectedVaccinationPetLive}
        onClose={() => {
          if (busyAction) return;
          setIsVaccinationModalOpen(false);
          setSelectedPetForVaccination(null);
        }}
        onSaveVaccination={handleSaveVaccination}
        onDeleteVaccination={deleteVaccination}
      />

      <PetDetailPanel
        pet={selectedPetLive}
        onClose={() => setSelectedPet(null)}
        onEdit={() => openEditModal(selectedPetLive)}
        onOpenMedical={() => openMedicalHistoryModal(selectedPetLive)}
        onOpenVaccination={() => openVaccinationModal(selectedPetLive)}
        onDelete={() => confirmDelete(selectedPetLive)}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        pet={petToDeleteLive}
        onClose={() => {
          if (busyAction) return;
          setDeleteModalOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
