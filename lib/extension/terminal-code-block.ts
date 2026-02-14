import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import TerminalCodeBlockComponent from "@/components/ui/TerminalCodeBlock";

export const TerminalCodeBlock = Node.create({
  name: "terminalBlock",

  group: "block",
  content: "text*",
  defining: true,
  code: true,

  addAttributes() {
    return {
      packageManager: {
        default: "npm",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="terminal-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "terminal-block",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TerminalCodeBlockComponent);
  },

  // Handle Enter key to insert line breaks
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        return editor.commands.insertContent('\n');
      },
    };
  },
});