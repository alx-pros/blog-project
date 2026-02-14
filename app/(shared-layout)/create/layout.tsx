"use client";

import Footer from "@/components/web/Footer";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col pt-20 max-w-3xl mx-auto px-4 gap-6">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
