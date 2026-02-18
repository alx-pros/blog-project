"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer bg-white dark:bg-black data-[state=checked]:text-black dark:data-[state=checked]:text-white data-[state=checked]:bg-[#FFEEE8] dark:data-[state=checked]:bg-[#1C0600] data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-in-out",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        forceMount
        className="
    flex items-center justify-center
    transition-all duration-300 ease-out
    data-[state=checked]:opacity-100
    data-[state=unchecked]:opacity-0
    text-primary
  "
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
