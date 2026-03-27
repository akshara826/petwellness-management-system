import { Product, ProductStatus } from "../types/marketplace";

const computeStatus = (stock: number): ProductStatus =>
  stock === 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "In Stock";

type ProductSeed = Omit<Product, "status">;

const seedProducts: ProductSeed[] = [
  {
    id: 1,
    name: "Premium Dog Food - Adult",
    category: "Food",
    price: 899,
    stock: 45,
    description:
      "High-protein adult dog food with real chicken. Supports muscle health and digestive wellness.",
    imageUrl:
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=300&fit=crop",
    createdDate: "2026-01-10",
    brand: "Pet Wellness",
  },
  {
    id: 2,
    name: "Interactive Puzzle Toy",
    category: "Toys",
    price: 349,
    stock: 3,
    description:
      "Mental stimulation toy for dogs and cats. Durable BPA-free plastic.",
    imageUrl:
      "https://images.pexels.com/photos/16010449/pexels-photo-16010449.jpeg?cs=srgb&dl=pexels-pinamon-16010449.jpg&fm=jpg",
    createdDate: "2026-01-15",
    brand: "Pet Wellness",
  },
  {
    id: 3,
    name: "Flea & Tick Treatment Drops",
    category: "Medicines",
    price: 450,
    stock: 0,
    description:
      "Monthly topical flea and tick prevention for dogs 10–25kg. Vet recommended.",
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
    createdDate: "2026-01-20",
    brand: "Pet Wellness",
  },
  {
    id: 4,
    name: "Adjustable Pet Harness",
    category: "Accessories",
    price: 599,
    stock: 28,
    description:
      "Comfortable escape-proof harness with padded chest plate and reflective strips.",
    imageUrl:
      "https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?cs=srgb&dl=pexels-brett-sayles-7210754.jpg&fm=jpg",
    createdDate: "2026-01-25",
    brand: "Pet Wellness",
  },
  {
    id: 5,
    name: "Grain-Free Cat Kibble",
    category: "Food",
    price: 649,
    stock: 18,
    description:
      "Grain-free premium cat food with salmon and sweet potato. Supports urinary health.",
    imageUrl:
      "https://images.pexels.com/photos/17730048/pexels-photo-17730048.jpeg?cs=srgb&dl=pexels-yana-kangal-494677995-17730048.jpg&fm=jpg",
    createdDate: "2026-02-01",
    brand: "Pet Wellness",
  },
  {
    id: 6,
    name: "Catnip Plush Mouse",
    category: "Toys",
    price: 149,
    stock: 2,
    description:
      "Soft plush catnip-filled mouse toy. Safe non-toxic materials. Pack of 2.",
    imageUrl:
      "https://images.pexels.com/photos/16260949/pexels-photo-16260949.jpeg?cs=srgb&dl=pexels-jem-perez-193020997-16260949.jpg&fm=jpg",
    createdDate: "2026-02-05",
    brand: "Pet Wellness",
  },
  {
    id: 7,
    name: "Vitamin & Mineral Supplement",
    category: "Medicines",
    price: 320,
    stock: 35,
    description:
      "Daily multivitamin chewable tablets. Omega-3, Vitamin D, Zinc. 60 tablets.",
    imageUrl:
      "https://images.pexels.com/photos/15897776/pexels-photo-15897776.jpeg?cs=srgb&dl=pexels-by-natallia-311038782-15897776.jpg&fm=jpg",
    createdDate: "2026-02-10",
    brand: "Pet Wellness",
  },
  {
    id: 8,
    name: "Stainless Steel Pet Bowl Set",
    category: "Accessories",
    price: 279,
    stock: 0,
    description:
      "Double stainless steel bowl set. Non-slip rubber base. Dishwasher safe.",
    imageUrl:
      "https://images.pexels.com/photos/7781984/pexels-photo-7781984.jpeg?cs=srgb&dl=pexels-rdne-7781984.jpg&fm=jpg",
    createdDate: "2026-02-14",
    brand: "Pet Wellness",
  },
];

export const initialProducts: Product[] = seedProducts.map((product) => ({
  ...product,
  status: computeStatus(product.stock),
}));
