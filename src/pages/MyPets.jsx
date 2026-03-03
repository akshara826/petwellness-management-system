import { useMemo, useState } from "react";
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
import { pets as petsData } from "../data/petsData";

const MAX_PETS = 5;

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

function toTitleGender(value) {
  if (value === "MALE") return "Male";
  if (value === "FEMALE") return "Female";
  return value || "-";
}

function computeVaccinationStatus(nextDueDate) {
  if (!nextDueDate) return "done";
  const now = new Date();
  const due = new Date(nextDueDate);
  if (due < now) return "overdue";
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 30) return "soon";
  return "upcoming";
}

function statusFromVaccines(vaccinations) {
  if (vaccinations.some((item) => item.status === "overdue")) return { status: "attention", statusLabel: "⚠ Attention" };
  if (vaccinations.some((item) => item.status === "soon")) return { status: "vaccine-due", statusLabel: "⚠ Vaccine Due" };
  return { status: "healthy", statusLabel: "✓ Healthy" };
}

function buildHealthReportBlocks(pet) {
  const medical = pet.medicalHistory || [];
  const vaccines = pet.vaccinations || [];
  const completed = vaccines.filter((item) => item.status === "done").length;
  const upcoming = vaccines.filter((item) => item.status === "soon" || item.status === "upcoming").length;
  const overdue = vaccines.filter((item) => item.status === "overdue").length;

  const latestMedical = medical.slice(0, 3);
  const latestVaccines = vaccines.slice(0, 5);

  return [
    { type: "title", text: "Pet Wellness - Health Report" },
    { type: "subtitle", text: "Summarized medical and vaccination profile" },
    { type: "meta", text: `Generated: ${new Date().toLocaleString("en-US")}` },
    { type: "spacer", text: "" },
    { type: "section", text: "Pet Profile" },
    { type: "line", text: `Pet ID: ${pet.id}` },
    { type: "line", text: `Name: ${pet.name}` },
    { type: "line", text: `Species/Breed: ${pet.species} / ${pet.breed}` },
    { type: "line", text: `Gender: ${pet.gender}` },
    { type: "line", text: `Date of Birth: ${pet.dateOfBirth}` },
    { type: "line", text: `Weight: ${pet.weight} kg` },
    { type: "line", text: `Current Status: ${pet.statusLabel}` },
    { type: "spacer", text: "" },
    { type: "section", text: "Key Metrics" },
    { type: "line", text: `Vet Visits: ${pet.vetVisits}` },
    { type: "line", text: `Vaccines Logged: ${pet.vaccines}` },
    { type: "line", text: `Orders: ${pet.orders}` },
    { type: "line", text: `Last Visit: ${pet.lastVisit}` },
    { type: "line", text: `Next Checkup: ${pet.nextCheckup}` },
    { type: "spacer", text: "" },
    { type: "section", text: "Vaccination Summary" },
    { type: "line", text: `Completed: ${completed}` },
    { type: "line", text: `Upcoming: ${upcoming}` },
    { type: "line", text: `Overdue: ${overdue}` },
    { type: "spacer", text: "" },
    { type: "section", text: "Recent Vaccination Records" },
    ...(latestVaccines.length
      ? latestVaccines.map((item, idx) => ({
          type: "line",
          text: `${idx + 1}. ${item.name} | Given: ${item.date || "N/A"} | Next Due: ${item.nextDueDate || "N/A"} | Status: ${item.status}`,
        }))
      : [{ type: "line", text: "No vaccination records available." }]),
    { type: "spacer", text: "" },
    { type: "section", text: "Recent Medical History" },
    ...(latestMedical.length
      ? latestMedical.map((item, idx) => ({
          type: "line",
          text: `${idx + 1}. ${item.visitDate} | Doctor: ${item.doctorName} | Diagnosis: ${item.diagnosis}${item.treatment ? ` | Treatment: ${item.treatment}` : ""}`,
        }))
      : [{ type: "line", text: "No medical history records available." }]),
  ];
}

function toAsciiPdfText(value) {
  return String(value)
    .replace(/✓/g, "Done")
    .replace(/⚠️|⚠/g, "Alert")
    .replace(/⏰/g, "Due Soon")
    .replace(/·/g, "-")
    .replace(/[^\x20-\x7E]/g, "");
}

function pdfEscape(value) {
  return toAsciiPdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function textWidthChars(fontSize, usableWidth) {
  return Math.max(24, Math.floor(usableWidth / (fontSize * 0.53)));
}

function wrapText(text, maxChars) {
  if (!text) return [""];
  const words = toAsciiPdfText(text).split(/\s+/);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [String(text)];
}

function buildReportPdf(pet) {
  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN_X = 52;
  const MARGIN_Y = 56;
  const USABLE_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

  const styles = {
    title: { size: 20, font: "F2", color: "0.10 0.14 0.20", lineHeight: 28 },
    subtitle: { size: 11, font: "F1", color: "0.11 0.44 0.85", lineHeight: 16 },
    meta: { size: 9, font: "F1", color: "0.42 0.48 0.55", lineHeight: 14 },
    section: { size: 11, font: "F2", color: "0.11 0.44 0.85", lineHeight: 18 },
    line: { size: 10, font: "F1", color: "0.10 0.14 0.20", lineHeight: 15 },
    spacer: { size: 10, font: "F1", color: "0 0 0", lineHeight: 8 },
  };

  const blocks = buildHealthReportBlocks(pet);
  const pages = [];
  let currentPage = [];
  let y = PAGE_HEIGHT - MARGIN_Y;

  const ensurePage = (nextHeight) => {
    if (y - nextHeight < MARGIN_Y) {
      pages.push(currentPage);
      currentPage = [];
      y = PAGE_HEIGHT - MARGIN_Y;
    }
  };

  blocks.forEach((block) => {
    const style = styles[block.type] || styles.line;
    if (block.type === "spacer") {
      ensurePage(style.lineHeight);
      y -= style.lineHeight;
      return;
    }

    const wrapped = wrapText(block.text, textWidthChars(style.size, USABLE_WIDTH));
    wrapped.forEach((line) => {
      ensurePage(style.lineHeight);
      currentPage.push({ x: MARGIN_X, y, text: line, style });
      y -= style.lineHeight;
    });

    if (block.type === "section") {
      ensurePage(10);
      currentPage.push({
        drawLine: true,
        x1: MARGIN_X,
        y1: y + 5,
        x2: PAGE_WIDTH - MARGIN_X,
        y2: y + 5,
        color: "0.89 0.92 0.94",
      });
      y -= 4;
    }
  });

  if (currentPage.length) pages.push(currentPage);

  const fontRegularId = 3;
  const fontBoldId = 4;
  const pageObjects = [];
  const contentObjects = [];
  let nextObjectId = 5;

  const contentStreams = pages.map((items, idx) => {
    const commands = [];
    if (idx === 0) {
      commands.push("0.18 0.83 0.63 rg");
      commands.push(`${MARGIN_X} ${PAGE_HEIGHT - MARGIN_Y - 34} ${PAGE_WIDTH - MARGIN_X * 2} 1 re f`);
    }
    items.forEach((item) => {
      if (item.drawLine) {
        commands.push(`${item.color} RG`);
        commands.push(`${item.x1} ${item.y1} m ${item.x2} ${item.y2} l S`);
        return;
      }
      commands.push("BT");
      commands.push(`${item.style.color} rg`);
      commands.push(`/${item.style.font} ${item.style.size} Tf`);
      commands.push(`1 0 0 1 ${item.x} ${item.y} Tm`);
      commands.push(`(${pdfEscape(item.text)}) Tj`);
      commands.push("ET");
    });
    return commands.join("\n");
  });

  contentStreams.forEach((stream) => {
    const contentId = nextObjectId++;
    const streamLen = new TextEncoder().encode(stream).length;
    contentObjects.push({ id: contentId, value: `<< /Length ${streamLen} >>\nstream\n${stream}\nendstream` });
    const pageId = nextObjectId++;
    pageObjects.push({
      id: pageId,
      contentId,
      value: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    });
  });

  const objects = [];
  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Kids [${pageObjects.map((item) => `${item.id} 0 R`).join(" ")}] /Count ${pageObjects.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
  contentObjects.forEach((obj) => {
    objects[obj.id] = obj.value;
  });
  pageObjects.forEach((obj) => {
    objects[obj.id] = obj.value;
  });

  let pdf = "%PDF-1.4\n";
  const xref = ["0000000000 65535 f "];
  for (let i = 1; i < objects.length; i += 1) {
    const offset = new TextEncoder().encode(pdf).length;
    xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${xref.length}\n${xref.join("\n")}\n`;
  pdf += `trailer\n<< /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

export default function MyPets() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pets, setPets] = useState(petsData);
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [selectedPetForMedical, setSelectedPetForMedical] = useState(null);

  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);
  const [selectedPetForVaccination, setSelectedPetForVaccination] = useState(null);

  const [selectedPet, setSelectedPet] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  const ownerName = useMemo(() => getLoggedInName(), []);
  const owner = useMemo(
    () => ({
      name: ownerName,
      avatar: ownerName.charAt(0)?.toUpperCase() || "P",
    }),
    [ownerName]
  );

  const petsWithUi = useMemo(
    () =>
      pets.map((pet) => ({
        ...pet,
        gender: toTitleGender(pet.gender),
        gradientClass: gradientClass(pet.colorClass),
      })),
    [pets]
  );

  const counts = useMemo(
    () => ({
      all: pets.length,
      dog: pets.filter((pet) => pet.species.toLowerCase() === "dog").length,
      cat: pets.filter((pet) => pet.species.toLowerCase() === "cat").length,
      other: pets.filter((pet) => !["dog", "cat"].includes(pet.species.toLowerCase())).length,
      due: pets.filter((pet) => pet.status === "vaccine-due" || pet.status === "attention").length,
    }),
    [pets]
  );

  const filteredPets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return petsWithUi
      .filter((pet) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "dog") return pet.species.toLowerCase() === "dog";
        if (activeFilter === "cat") return pet.species.toLowerCase() === "cat";
        if (activeFilter === "other") return !["dog", "cat"].includes(pet.species.toLowerCase());
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

  const openMedicalHistoryModal = (pet) => {
    setSelectedPetForMedical(pet);
    setIsMedicalModalOpen(true);
  };

  const openVaccinationModal = (pet) => {
    setSelectedPetForVaccination(pet);
    setIsVaccinationModalOpen(true);
  };

  const openDetail = (pet) => {
    setSelectedPet(pet);
  };

  const confirmDelete = (pet) => {
    setPetToDelete(pet);
    setDeleteModalOpen(true);
  };

  const handleSavePet = (formData, imagePreview) => {
    if (editingPet) {
      setPets((prev) =>
        prev.map((pet) =>
          pet.id === editingPet.id
            ? {
                ...pet,
                name: formData.name.trim(),
                species: formData.species.trim(),
                breed: formData.breed.trim() || "-",
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
                weight: formData.weight ? Number(formData.weight) : pet.weight,
                imageUrl: imagePreview || pet.imageUrl,
              }
            : pet
        )
      );
      setIsAddEditModalOpen(false);
      setEditingPet(null);
      return;
    }

    const nextNo = String(pets.length + 1).padStart(3, "0");
    const created = {
      id: `PET-${nextNo}`,
      name: formData.name.trim(),
      species: formData.species.trim(),
      breed: formData.breed.trim() || "-",
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      weight: formData.weight ? Number(formData.weight) : 0,
      imageUrl: imagePreview,
      colorClass: ["c4", "c5"][(pets.length + 1) % 2],
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
    setPets((prev) => [...prev, created]);
    setIsAddEditModalOpen(false);
  };

  const handleSaveMedicalRecord = (petId, record) => {
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? { ...pet, vetVisits: pet.vetVisits + 1, medicalHistory: [record, ...(pet.medicalHistory || [])], lastVisit: record.visitDate, nextCheckup: record.nextVisitDate || pet.nextCheckup }
          : pet
      )
    );
  };

  const handleSaveVaccination = (petId, vaccination) => {
    const withStatus = { ...vaccination, status: computeVaccinationStatus(vaccination.nextDueDate) };
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;
        const list = [withStatus, ...(pet.vaccinations || [])];
        const statusData = statusFromVaccines(list);
        return { ...pet, vaccinations: list, vaccines: pet.vaccines + 1, ...statusData };
      })
    );
  };

  const handleDelete = () => {
    if (!petToDelete) return;
    setPets((prev) => prev.filter((pet) => pet.id !== petToDelete.id));
    if (selectedPet?.id === petToDelete.id) setSelectedPet(null);
    setDeleteModalOpen(false);
    setPetToDelete(null);
  };

  const deleteMedicalRecord = (petId, recordId) => {
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? { ...pet, medicalHistory: (pet.medicalHistory || []).filter((item) => item.id !== recordId) }
          : pet
      )
    );
  };

  const deleteVaccination = (petId, vaccinationId) => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;
        const list = (pet.vaccinations || []).filter((item) => item.id !== vaccinationId);
        const statusData = statusFromVaccines(list);
        return { ...pet, vaccinations: list, ...statusData };
      })
    );
  };

  const downloadHealthReport = (pet) => {
    const blob = buildReportPdf(pet);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pet.name.replace(/\s+/g, "-").toLowerCase()}-health-report.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
            addDisabled={!canAddMore}
            addTooltip={!canAddMore ? "Maximum 5 pets allowed" : ""}
          />

          <FilterTabs activeFilter={activeFilter} onChangeFilter={setActiveFilter} counts={counts} viewMode={viewMode} onChangeView={setViewMode} />

          {!canAddMore ? (
            <div className="rounded-2xl border border-app-yellow bg-app-yellow-light px-4 py-3 text-sm font-semibold text-[#92400E]">
              ⚠️ You've reached the maximum limit of 5 pets. Remove a pet profile to add a new one.
            </div>
          ) : null}

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
        </div>
      </main>

      <AddEditPetModal
        isOpen={isAddEditModalOpen}
        editingPet={editingPet}
        petsCount={pets.length}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingPet(null);
        }}
        onSave={handleSavePet}
      />

      <MedicalHistoryModal
        isOpen={isMedicalModalOpen}
        pet={selectedMedicalPetLive}
        onClose={() => {
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

      <DeleteConfirmModal isOpen={deleteModalOpen} pet={petToDeleteLive} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}
