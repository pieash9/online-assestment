"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, List, Redo2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-18 w-full rounded-b-lg px-3 py-2 text-sm text-[#334155] focus:outline-none [&_p.is-editor-empty:first-child::before]:text-[#9ca3af] [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_ul]:list-disc [&_ul]:pl-4",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const toolbarButtonClass =
    "inline-flex h-6 w-6 items-center justify-center rounded text-[#64748b] hover:bg-[#f3f4f6] hover:text-[#334155]";

  return (
    <div className={cn("overflow-hidden rounded-lg border border-[#d7dde7] bg-white", className)}>
      <div className="flex items-center gap-1 border-b border-[#edf1f5] px-2 py-1.5 text-xs">
        <button
          className={toolbarButtonClass}
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-3.5" />
        </button>
        <button
          className={toolbarButtonClass}
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-3.5" />
        </button>
        <span className="mx-1 h-4 w-px bg-[#e5e7eb]" />
        <button
          className={cn(toolbarButtonClass, editor.isActive("bold") && "bg-[#f3f4f6] text-[#1f2937]")}
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </button>
        <button
          className={cn(toolbarButtonClass, editor.isActive("italic") && "bg-[#f3f4f6] text-[#1f2937]")}
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </button>
        <button
          className={cn(
            toolbarButtonClass,
            editor.isActive("bulletList") && "bg-[#f3f4f6] text-[#1f2937]",
          )}
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
