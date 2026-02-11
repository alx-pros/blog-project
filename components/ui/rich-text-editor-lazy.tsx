"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "./skeleton";

const EditorContent = dynamic(() => import("./rich-text-editor").then(mod => ({ default: mod.RichTextEditor })), {
  loading: () => <Skeleton className="h-80 w-full" />,
  ssr: false,
});

export function RichTextEditorLazy(props: any) {
  return <EditorContent {...props} />;
}
