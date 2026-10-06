import { useContext } from "react";
import { ProductContext } from "./productContextObject";

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within a ProductProvider");
  return ctx;
}