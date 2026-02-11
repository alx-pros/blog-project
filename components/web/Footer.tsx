"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(2025);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer>
      <div className="flex w-full h-full items-center justify-center py-4 border-t">
        <p className="text-left text-sm md:text-md lg:text-lg leading-normal text-[#666666] dark:text-[#A0A0A0]">
          © {mounted ? currentYear : 2025} The Web Room. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
