"use client";

import Footer from "@/components/web/Footer";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col dark:bg-[#161515]">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
