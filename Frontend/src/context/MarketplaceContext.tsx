import { ReactNode, createContext, useContext, useState } from "react";
import { initialProducts } from "../data/marketplaceProducts";
import { Product, ProductStatus } from "../types/marketplace";

interface MarketplaceContextType {
  products: Product[];
  addProduct: (p: Omit<Product, "id" | "createdDate" | "status">, imageFile: File | null) => void;
  updateProduct: (id: number, p: Partial<Product>, imageFile: File | null) => void;
  deleteProduct: (id: number) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

const computeStatus = (stock: number): ProductStatus =>
  stock === 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "In Stock";

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (
    data: Omit<Product, "id" | "createdDate" | "status">,
    imageFile: File | null
  ) => {
    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : data.imageUrl || "";
    const newProduct: Product = {
      ...data,
      id: Date.now(),
      status: computeStatus(data.stock),
      imageUrl,
      createdDate: new Date().toISOString().split("T")[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: number, data: Partial<Product>, imageFile: File | null) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== id) {
          return product;
        }
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : product.imageUrl;
        const stock = data.stock ?? product.stock;
        return {
          ...product,
          ...data,
          imageUrl,
          status: computeStatus(stock),
        };
      })
    );
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  return (
    <MarketplaceContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export const useMarketplace = () => {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error("useMarketplace must be inside MarketplaceProvider");
  }
  return ctx;
};
