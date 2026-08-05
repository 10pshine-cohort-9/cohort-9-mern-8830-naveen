import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Redo,
  Undo,
  MoreHorizontal,
} from "lucide-react";
import '../editor.css';
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
//import UnderlineExtension from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

const ToolbarButton = ({ icon: Icon, label, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`rounded-md p-1.5 transition ${
      active
        ? "bg-clay text-white"
        : "text-ink/60 hover:bg-sand"
    }`}
  >
    <Icon size={15} />
  </button>
);

const NoteEditor = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("Shopping List");
  const [favourite, setFavourite] = useState(false);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
  extensions: [
    StarterKit.configure({
      bulletList: {},
      orderedList: {},
      blockquote: {},
    }),
    Link,
    Image,
  ],
  content: "<p>Start writing...</p>",
});

  const plainText = editor?.getText() || "";

  const words = plainText.trim()
    ? plainText.trim().split(/\s+/).length
    : 0;

  const chars = plainText.length;

  const handleSaveNow = () => {
    setSaving(true);

    const html = editor?.getHTML();

    console.log(html);

    setTimeout(() => {
      setSaving(false);
      alert("Save successful!");
    }, 1000);
  };

  const handleCancel = () => {
    navigate("/notes");
  };

  const handleToggleFavourite = () => {
    setFavourite((prev) => !prev);
  };

  const insertLink = () => {
    const url = prompt("Enter URL");

    if (!url) return;

    editor
      ?.chain()
      .focus()
      .setLink({ href: url })
      .run();
  };

  const insertImage = () => {
    const url = prompt("Paste image URL");

    if (!url) return;

    editor
      ?.chain()
      .focus()
      .setImage({ src: url })
      .run();
  };

  if (!editor) return null;
    return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/notes")}
            className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink"
          >
            <ArrowLeft size={15} />
            Back to all notes
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ink/40">
              {saving ? "Saving..." : "Saved just now"}
            </span>

            <button
              onClick={handleCancel}
              className="rounded-lg border border-black/10 px-4 py-1.5 text-sm hover:bg-sand/40"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveNow}
              className="rounded-lg bg-clay px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Save Note
            </button>

            <button className="text-ink/40 hover:text-ink/70">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-ink/30"
          />

          <button
            onClick={handleToggleFavourite}
            className="text-ink/30 hover:text-clay"
          >
            <Star
              size={20}
              fill={favourite ? "#b08968" : "none"}
              className={favourite ? "text-clay" : ""}
            />
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1.5">

          <ToolbarButton
            icon={Bold}
            label="Bold"
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />

          <ToolbarButton
            icon={Italic}
            label="Italic"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />

          <ToolbarButton
            icon={Underline}
            label="Underline"
            active={editor?.isActive("underline")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />

          <ToolbarButton
            icon={Strikethrough}
            label="Strike"
            active={editor?.isActive("strike")}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          />

          <ToolbarButton
            icon={Code}
            label="Code"
            active={editor?.isActive("code")}
            onClick={() => editor?.chain().focus().toggleCode().run()}
          />

          <span className="mx-1 h-4 w-px bg-black/10" />

          <ToolbarButton
            icon={List}
            label="Bullet List"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />

          <ToolbarButton
            icon={ListOrdered}
            label="Numbered List"
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />

          <ToolbarButton
            icon={Quote}
            label="Quote"
            active={editor?.isActive("blockquote")}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          />

          <ToolbarButton
            icon={LinkIcon}
            label="Insert Link"
            onClick={insertLink}
          />

          <ToolbarButton
            icon={ImageIcon}
            label="Insert Image"
            onClick={insertImage}
          />

          <span className="ml-auto flex items-center gap-1">

            <ToolbarButton
              icon={Undo}
              label="Undo"
              onClick={() => editor.chain().focus().undo().run()}
            />

            <ToolbarButton
              icon={Redo}
              label="Redo"
              onClick={() => editor.chain().focus().redo().run()}
            />

          </span>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-4 min-h-[420px]">
          <EditorContent editor={editor} />
        </div>

        <p className="mt-3 text-xs text-ink/40">
          {words} words • {chars} characters
        </p>
      </main>
    </div>
  );
};

export default NoteEditor;