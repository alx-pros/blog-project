// lib/extension/badge.ts
import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    badge: {
      toggleBadge: () => ReturnType;
    };
  }
}

export const Badge = Mark.create({
  name: "badge",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) =>
          (element as HTMLElement).hasAttribute("data-badge") ? {} : false,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-badge": "",
        class: "inline-flex items-center justify-center px-1 rounded-md text-[length:inherit] text-black dark:text-white font-mono tracking-tight bg-[#EAEAEA] dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#1E1E1E]",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleBadge:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },
});