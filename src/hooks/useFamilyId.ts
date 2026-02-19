"use client";

import { useEffect, useState } from "react";

export function useFamilyId() {
  const [familyId, setFamilyId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("familyId");
    if (stored) setFamilyId(stored);

    function handleStorage(e: StorageEvent) {
      if (e.key === "familyId") setFamilyId(e.newValue ?? "");
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function saveFamilyId(id: string) {
    localStorage.setItem("familyId", id);
    setFamilyId(id);
  }

  function clearFamilyId() {
    localStorage.removeItem("familyId");
    setFamilyId("");
  }

  return { familyId, saveFamilyId, clearFamilyId };
}
