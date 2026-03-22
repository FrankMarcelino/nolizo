"use client";

import { useEffect, useState } from "react";

export function useFamilyId() {
  const [familyId, setFamilyId] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.familyId) setFamilyId(json.familyId);
      })
      .catch(() => {});
  }, []);

  return { familyId };
}
