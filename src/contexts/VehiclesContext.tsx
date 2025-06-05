"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Vehicle {
  id:               string;
  label:            string;
  year:             string;
  make_name:        string;
  model_name:       string;
  engine_base_name: string;
}

interface VehiclesContextValue {
  vehicles: Vehicle[];
  currentVehicleId: string | null;
  addVehicle: (v: Vehicle) => void;
  removeVehicle: (id: string) => void;
  setCurrentVehicle: (id: string) => void;
  setCurrentVehicleId: React.Dispatch<React.SetStateAction<string | null>>;
}

const VehiclesContext = createContext<VehiclesContextValue | undefined>(undefined);

export const VehiclesProvider = ({ children }: { children: ReactNode }) => {
  // 1) Lazy‐initialize `vehicles` from localStorage (if present)
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const raw = localStorage.getItem("vehicles");
      return raw ? JSON.parse(raw) : [];
    } catch {
      console.error("Failed to parse `vehicles` from localStorage");
      return [];
    }
  });

  // 2) Lazy‐initialize `currentVehicleId` from localStorage (if present)
  const [currentVehicleId, setCurrentVehicleId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem("currentVehicleId");
  });

  // 3) Whenever `vehicles` or `currentVehicleId` changes, sync them to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Store the array of vehicles
    try {
      localStorage.setItem("vehicles", JSON.stringify(vehicles));
    } catch {
      console.error("Failed to save `vehicles` to localStorage");
    }

    // Store (or remove) the selected vehicle ID
    if (currentVehicleId === null) {
      localStorage.removeItem("currentVehicleId");
    } else {
      localStorage.setItem("currentVehicleId", currentVehicleId);
    }
  }, [vehicles, currentVehicleId]);

  const addVehicle = (v: Vehicle) => {
    setVehicles((prev) => [...prev, v]);
    setCurrentVehicleId(v.id);
  };

  const removeVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((x) => x.id !== id));
    if (currentVehicleId === id) {
      setCurrentVehicleId(null);
    }
  };

  const setCurrentVehicle = (id: string) => {
    if (vehicles.some((v) => v.id === id)) {
      setCurrentVehicleId(id);
    }
  };

  return (
    <VehiclesContext.Provider
      value={{
        vehicles,
        currentVehicleId,
        addVehicle,
        removeVehicle,
        setCurrentVehicle,
        setCurrentVehicleId,
      }}
    >
      {children}
    </VehiclesContext.Provider>
  );
};

export const useVehicles = () => {
  const ctx = useContext(VehiclesContext);
  if (!ctx) throw new Error("useVehicles must be used within VehiclesProvider");
  return ctx;
};