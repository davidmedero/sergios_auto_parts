"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Vehicle {
  id: string;
  label: string;
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentVehicleId, setCurrentVehicleId] = useState<string | null>(null);

  const addVehicle = (v: Vehicle) => {
    setVehicles(prev => [...prev, v]);
    setCurrentVehicleId(v.id);
  };

  const removeVehicle = (id: string) => {
    setVehicles(prev => prev.filter(x => x.id !== id));
    if (currentVehicleId === id) setCurrentVehicleId(null);
  };

  const setCurrentVehicle = (id: string) => {
    if (vehicles.some(v => v.id === id)) {
      setCurrentVehicleId(id);
    }
  };

  return (
    <VehiclesContext.Provider
      value={{ vehicles, currentVehicleId, addVehicle, removeVehicle, setCurrentVehicle, setCurrentVehicleId }}
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