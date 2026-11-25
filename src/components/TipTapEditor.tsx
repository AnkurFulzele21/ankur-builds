"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Heading2, Heading3, Italic, Link2, List, Quote } from "lucide-react";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Write your story here...",
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExt.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[140px] px-3.5 py-3 text-[13.5px] leading-relaxed text-[#18181B] focus:outline-none",
      },
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[140px] rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3 text-[12.5px] text-[#8C8B87]">
        Loading TipTap editor...
      </div>
    );
  }

  function addLink() {
    if (!editor) return;
    const url = window.prompt("Enter URL (https://...)");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const btnCls = (active: boolean) =>
    `rounded-lg p-1.5 transition ${
      active
        ? "bg-[#18181B] text-white"
        : "text-[#6E6D6A] hover:bg-[#EAE8E3]/70 hover:text-[#18181B]"
    }`;

  return (
    <div className="overflow-hidden rounded-xl border border-[#EAE8E3] bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#EAE8E3] bg-[#FAF9F6] px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnCls(editor.isActive("bold"))}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnCls(editor.isActive("italic"))}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnCls(editor.isActive("heading", { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btnCls(editor.isActive("heading", { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnCls(editor.isActive("bulletList"))}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnCls(editor.isActive("blockquote"))}
          title="Quote"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={addLink}
          className={btnCls(editor.isActive("link"))}
          title="Insert Link"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
