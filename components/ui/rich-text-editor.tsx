"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "./button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
} from "lucide-react";
import { useCallback, useRef, useEffect } from "react";
import "./rich-text-editor.css";

interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string, html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange?.(text, html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 bg-muted p-2 flex-wrap border-b">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          variant={editor.isActive("bold") ? "default" : "outline"}
          size="sm"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          variant={editor.isActive("italic") ? "default" : "outline"}
          size="sm"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"}
          size="sm"
          className={editor.isActive("heading", { level: 1 }) ? "bg-blue-600 hover:bg-blue-700" : ""}
          title="Heading 1 (Large)"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
          size="sm"
          className={editor.isActive("heading", { level: 2 }) ? "bg-blue-600 hover:bg-blue-700" : ""}
          title="Heading 2 (Medium)"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
          size="sm"
          className={editor.isActive("heading", { level: 3 }) ? "bg-blue-600 hover:bg-blue-700" : ""}
          title="Heading 3 (Small)"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          size="sm"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          size="sm"
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          variant="outline"
          size="sm"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          variant="outline"
          size="sm"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-neutral dark:prose-invert max-w-none p-4 min-h-80 cursor-text"
      />
    </div>
  );
}
