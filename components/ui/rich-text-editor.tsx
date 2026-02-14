"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "./button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code2,
  Undo,
  Redo,
  Terminal,
  Tag,
} from "lucide-react";
import { useEffect } from "react";
import { FileCodeBlock } from "@/lib/extension/file-code-block";
import { TerminalCodeBlock } from "@/lib/extension/terminal-code-block";
import { Badge } from "@/lib/extension/badge";

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
        codeBlock: false,
      }),
      FileCodeBlock,
      TerminalCodeBlock,
      Badge,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
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

  const handleToggleLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 sm:gap-2 bg-white/50 dark:bg-black/50 p-2 flex-wrap border-b">
        <Button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          variant="outline"
          size="sm"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          variant="outline"
          size="sm"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="hidden sm:block w-px h-6 bg-border" />
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"}
          size="sm"
          title="Heading 1 (Large)"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
          size="sm"
          title="Heading 2 (Medium)"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
          size="sm"
          title="Heading 3 (Small)"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="hidden sm:block w-px h-6 bg-border" />
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          variant={editor.isActive("bold") ? "default" : "outline"}
          size="sm"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          variant={editor.isActive("italic") ? "default" : "outline"}
          size="sm"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={handleToggleLink}
          variant={editor.isActive("link") ? "default" : "outline"}
          size="sm"
          title="Insert link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <div className="hidden sm:block w-px h-6 bg-border" />

        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          size="sm"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          size="sm"
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="hidden sm:block w-px h-6 bg-border" />

        <Button
          type="button"
          onClick={() => editor?.chain().focus().toggleBadge().run()}
          variant="outline"
          size="sm"
          title="Tag"
        >
          <Tag />
        </Button>

        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          variant={editor.isActive("blockquote") ? "default" : "outline"}
          size="sm"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="hidden sm:block w-px h-6 bg-border" />
        <Button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "outline"}
          size="sm"
          title="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          variant={editor.isActive({ textAlign: "center" }) ? "default" : "outline"}
          size="sm"
          title="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          variant={editor.isActive({ textAlign: "right" }) ? "default" : "outline"}
          size="sm"
          title="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          variant={editor.isActive({ textAlign: "justify" }) ? "default" : "outline"}
          size="sm"
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <div className="hidden sm:block w-px h-6 bg-border" />

        <Button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: "fileCodeBlock",
                attrs: {
                  language: "tsx",
                  filename: "app/layout.tsx",
                },
              })
              .run()
          }
          size="sm"
        >
          <Code2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={() => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "terminalBlock",
                attrs: {
                  packageManager: "npm",
                },
              })
              .run();
          }}
          size="sm"
        >
          <Terminal className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className="
relative prose prose-neutral dark:prose-invert max-w-none
px-4 py-6 h-[500px] overflow-y-auto cursor-text text-paragraph
bg-white dark:bg-black
focus:outline-none

[&_.ProseMirror]:outline-none
[&_.ProseMirror>*+*]:mt-3

[&_.ProseMirror_ul]:pl-4
[&_.ProseMirror_ul]:list-disc
[&_.ProseMirror_ul]:flex
[&_.ProseMirror_ul]:flex-col
[&_.ProseMirror_ul]:gap-2
[&_.ProseMirror_ol]:pl-4
[&_.ProseMirror_ol]:list-decimal
[&_.ProseMirror_ol]:flex
[&_.ProseMirror_ol]:flex-col
[&_.ProseMirror_ol]:gap-2


[&_.ProseMirror_h1]:text-3xl
[&_.ProseMirror_h1]:font-black
[&_.ProseMirror_h1]:text-black
dark:[&_.ProseMirror_h1]:text-white
[&_.ProseMirror_h1]:leading-tight
[&_.ProseMirror_h1]:my-4

[&_.ProseMirror_h2]:text-2xl
[&_.ProseMirror_h2]:font-bold
[&_.ProseMirror_h2]:text-black
dark:[&_.ProseMirror_h2]:text-white
[&_.ProseMirror_h2]:my-3

[&_.ProseMirror_h3]:text-xl
[&_.ProseMirror_h3]:font-semibold
[&_.ProseMirror_h3]:text-black
dark:[&_.ProseMirror_h3]:text-white
[&_.ProseMirror_h3]:my-3

[&_.ProseMirror_code]:bg-muted
[&_.ProseMirror_code]:px-1
[&_.ProseMirror_code]:py-0.5
[&_.ProseMirror_code]:rounded
[&_.ProseMirror_code]:text-sm

[&_.ProseMirror_pre_code]:bg-transparent
[&_.ProseMirror_pre_code]:p-0

[&_.ProseMirror_blockquote]:border-l-4
[&_.ProseMirror_blockquote]:pl-4
[&_.ProseMirror_blockquote]:italic
[&_.ProseMirror_blockquote]:my-6
[&_.ProseMirror_blockquote]:border-black/10
dark:[&_.ProseMirror_blockquote]:border-white/20


[&_.ProseMirror_hr]:my-8
[&_.ProseMirror_hr]:border-t-2
[&_.ProseMirror_hr]:border-black/10
dark:[&_.ProseMirror_hr]:border-white/10

[&_.ProseMirror_a]:text-primary
hover:[&_.ProseMirror_a]:underline
hover:[&_.ProseMirror_a]:cursor-pointer
"
      />
    </div>
  );
}
