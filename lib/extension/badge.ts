import { Mark, mergeAttributes, RawCommands } from "@tiptap/core";

export const Badge = Mark.create({
  name: "badge",
  code: true,
  inclusive: false,

  parseHTML() {
    return [{ tag: "span[data-badge]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-badge": "",
        class:
          "px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-black dark:text-blue-300",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleBadge: {
        run: () => {
          return ({ commands }: any) => {
            return commands.toggleMark(this.name);
          };
        },
      },
    } as Partial<RawCommands>;
  },
});
