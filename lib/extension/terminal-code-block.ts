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
      // Hidden storage for the tabs
      npmContent: {
        default: "",
      },
      pnpmContent: {
        default: "",
      },
      yarnContent: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="terminal-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "terminal-block" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TerminalCodeBlockComponent);
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;
        const node = $from.node($from.depth);
        if (node.textContent.length === 0) {
          return editor.commands.deleteNode("terminalBlock");
        }
        return false;
      },
    };
  },
});