export const user = { name: "Alex Johnson", avatar: "A" };

export const pets = [
  {
    id: 1,
    name: "Bruno",
    breed: "Golden Retriever",
    age: "3 yrs",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=240&h=240&fit=crop",
    emoji: "\uD83D\uDC15",
    gradientClass: "bg-gradient-to-br from-app-teal-light to-[#A7EDD8]",
    status: "\u2713 Healthy",
    statusType: "healthy",
  },
  {
    id: 2,
    name: "Luna",
    breed: "Persian Cat",
    age: "2 yrs",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=240&h=240&fit=crop",
    emoji: "\uD83D\uDC08",
    gradientClass: "bg-gradient-to-br from-app-blue-light to-[#B8D9F5]",
    status: "\u26A0 Vaccine Due",
    statusType: "warning",
  },
  {
    id: 3,
    name: "Coco",
    breed: "Holland Lop",
    age: "1 yr",
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=240&h=240&fit=crop",
    emoji: "\uD83D\uDC07",
    gradientClass: "bg-gradient-to-br from-app-red-light to-[#FECACA]",
    status: "\u2713 Healthy",
    statusType: "healthy",
  },
];

export const appointments = [
  {
    id: 1,
    month: "Mar",
    day: "04",
    title: "General Checkup",
    pet: "Bruno",
    doctor: "Dr. Anika Sharma",
    time: "10:30 AM",
    type: "Clinic",
  },
  {
    id: 2,
    month: "Mar",
    day: "08",
    title: "Dental Check",
    pet: "Luna",
    doctor: "Dr. Raj Kumar",
    time: "3:00 PM",
    type: "Online",
  },
];

export const vaccines = [
  {
    id: 1,
    icon: "\uD83D\uDC89",
    name: "Rabies",
    pet: "Luna",
    dueText: "Feb 10, 2026",
    status: "Overdue",
  },
  {
    id: 2,
    icon: "\uD83E\uDDEC",
    name: "DHPP Booster",
    pet: "Bruno",
    dueText: "Due in 14 days",
    status: "Soon",
  },
  {
    id: 3,
    icon: "\uD83D\uDEE1\uFE0F",
    name: "Myxomatosis",
    pet: "Coco",
    dueText: "Apr 15, 2026",
    status: "On Track",
  },
];

export const products = [
  { id: 1, name: "Dental Chews", price: "\u20B9299", emoji: "\uD83E\uDDB4", bgClass: "bg-app-teal-light" },
  { id: 2, name: "Cat Kibble", price: "\u20B9499", emoji: "\uD83D\uDC31", bgClass: "bg-app-blue-light" },
  { id: 3, name: "Squeaky Toy", price: "\u20B9149", emoji: "\uD83E\uDDF8", bgClass: "bg-app-yellow-light" },
  { id: 4, name: "Flea Drops", price: "\u20B9350", emoji: "\uD83D\uDC8A", bgClass: "bg-app-red-light" },
];

export const orders = [
  {
    id: 1,
    emoji: "\uD83E\uDDB4",
    name: "Dental Chews \u00D7 2",
    date: "Feb 22, 2026",
    price: "\u20B9598",
    status: "Delivered",
    statusType: "green",
  },
  {
    id: 2,
    emoji: "\uD83D\uDC8A",
    name: "Flea Drops + Shampoo",
    date: "Feb 25, 2026",
    price: "\u20B9720",
    status: "In Transit",
    statusType: "yellow",
  },
];

export const brunoHealth = {
  petName: "Bruno",
  petIcon: "\uD83D\uDC15",
  lastCheck: "Feb 15, 2026",
  weight: { label: "Weight", value: "28kg", pct: 72 },
  activity: { label: "Activity", value: "Good", pct: 85 },
  vaccines: { label: "Vaccinations", value: "2/3", pct: 66 },
};

export const quickActions = [
  { id: 1, icon: "\uD83D\uDCC5", label: "Book Appointment", type: "primary" },
  { id: 2, icon: "\uD83D\uDC3E", label: "Add New Pet", type: "secondary" },
  { id: 3, icon: "\uD83D\uDED2", label: "Shop Products", type: "tertiary" },
];
