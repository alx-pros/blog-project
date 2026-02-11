import Image from "next/image";
import { ReactNode } from "react";
import { Logo } from "../Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative flex w-full">
      {/* LEFT SIDE */}
      <div className="relative hidden lg:block w-1/2">
        {/* Background image */}
        <Image
          src="/side-background.jpg"
          alt="side background"
          fill
          priority
          className="object-cover pointer-events-none"
        />

        {/* Overlay content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          {/* Top */}
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">The Web Room</h1>
          </div>

          {/* Bottom */}
          <blockquote className="text-left md:text-xl leading-normal">
            "Never thought it was possible to have such a large community, but here we are."
            <span className="mt-2 block opacity-80">— Dale Larrison (Founder)</span>
          </blockquote>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
