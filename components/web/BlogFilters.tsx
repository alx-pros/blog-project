// BlogFilters.tsx
"use client";

import { useState } from "react";

export default function BlogFilters() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filters = [
    { key: "Web Development", label: "Web Development" },
    { key: "Design & UI", label: "Design & UI" },
    { key: "AI", label: "AI" },
    { key: "Engineering", label: "Engineering" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() =>
            setActiveFilters((prev) =>
              prev.includes(filter.key)
                ? prev.filter((f) => f !== filter.key)
                : [...prev, filter.key]
            )
          }
          className={`px-4 py-2 rounded-full text-sm cursor-pointer ${
            activeFilters.includes(filter.key)
              ? "bg-[#FFEEE8] dark:bg-[#1C0600] text-primary"
              : "bg-[#EDEDED] dark:bg-[#202020]"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}