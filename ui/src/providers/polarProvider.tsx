"use client";
import { Product } from "@polar-sh/sdk/models/components/product.js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "./userProvider";
import { PolarMeterResponse } from "@/app/api/protected/polar/meters/types";

interface PolarProviderProps {
  children: React.ReactNode;
}

interface PolarContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
  productsLoading: boolean;
  metersLoading: boolean;
  ocrProduct: Product | undefined;
  ocrMeter: PolarMeterResponse["OCRMeter"] | null;
  ocrSubscription: PolarMeterResponse["OCRSubscription"] | null;
}

const PolarContext = createContext<PolarContextType>({
  products: [],
  setProducts: () => {},
  productsLoading: true,
  metersLoading: true,
  ocrProduct: undefined,
  ocrMeter: null,
  ocrSubscription: null,
});

const PRODUCT_IDS = [process.env.NEXT_PUBLIC_POLAR_OCR_PRODUCT_ID];

export function PolarProvider({ children }: PolarProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [ocrMeter, setOcrMeter] =
    useState<PolarMeterResponse["OCRMeter"]>(null);
  const [ocrSubscription, setOcrSubscription] =
    useState<PolarMeterResponse["OCRSubscription"]>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [metersLoading, setMetersLoading] = useState(true);
  const { selectedOrg } = useUser();

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const resp = await fetch(
        `/api/protected/polar/products?productIds=${PRODUCT_IDS.join(",")}`
      );
      const data = await resp.json();
      setProducts(data.products);
    } catch {
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchMeters = useCallback(async () => {
    try {
      if (!selectedOrg) {
        setMetersLoading(false);
        return;
      }
      setMetersLoading(true);
      const resp = await fetch(
        `/api/protected/polar/meters?organizationId=${selectedOrg?.id}`
      );
      const data = await resp.json();
      setOcrMeter(data.OCRMeter);
      setOcrSubscription(data.OCRSubscription);
    } catch {
    } finally {
      setMetersLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchMeters();
  }, [selectedOrg, fetchMeters]);

  const ocrProduct = products.find(
    (product) => product.id === process.env.NEXT_PUBLIC_POLAR_OCR_PRODUCT_ID
  );

  return (
    <PolarContext.Provider
      value={{
        products,
        setProducts,
        ocrProduct,
        productsLoading,
        metersLoading,
        ocrMeter,
        ocrSubscription,
      }}
    >
      {children}
    </PolarContext.Provider>
  );
}

export const usePolar = () => {
  const context = useContext(PolarContext);
  if (!context) {
    throw new Error("usePolar must be used within a PolarProvider");
  }
  return context;
};
