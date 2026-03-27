export type Category =
  | "Food"
  | "Toys"
  | "Grooming"
  | "Medicines"
  | "Accessories";

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Inactive";

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  status: ProductStatus;
  createdDate: string;
  brand: string;
}
