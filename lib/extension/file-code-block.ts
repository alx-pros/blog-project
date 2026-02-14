import { ReactNodeViewRenderer } from "@tiptap/react";
import FileCodeBlockComponent from "@/components/ui/FileCodeBlock";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import { createLowlight } from "lowlight";
import ts from "highlight.js/lib/languages/typescript";
import js from "highlight.js/lib/languages/javascript";

const lowlight = createLowlight();

lowlight.register("ts", ts);
lowlight.register("tsx", ts);
lowlight.register("js", js);

export const FileCodeBlock = CodeBlockLowlight.extend({
  name: "fileCodeBlock",
  addAttributes() {
    return {
      ...this.parent?.(),
      filename: {
        default: "app/example.tsx",
      },
      language: {
        default: "tsx",
      },
      highlightedLine: {
        default: [],
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileCodeBlockComponent);
  },
}).configure({
  lowlight,
});
