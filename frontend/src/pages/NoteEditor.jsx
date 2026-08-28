import React, { useEffect, useState } from "react";
import {ArrowLeft,Star,Bold,Italic,Underline as underline_icon,Strikethrough,Code,List,ListOrdered,Link as LinkIcon,Image as ImageIcon,Quote,Redo,Undo,MoreHorizontal,} from "lucide-react";
import '../editor.css';
import Sidebar from "../components/Sidebar";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import {createNote, getNote, updateNote} from '../api/notes';
import {useAuth} from '../context/AuthContext';
import { updateMe } from "../api/auth";


const ToolbarButton = ({ icon: Icon, label, onClick, active }) => (
  <button type="button" onClick={onClick} aria-label={label} title={label} className={`rounded-md p-1.5 transition ${ active ? "bg-clay text-white": "text-ink/60 hover:bg-sand"}`}>
    <Icon size={15} />
  </button>
);

const NoteEditor = () => {
  const {user, refreshUser} = useAuth();
  const {id} =useParams();
  const navigate = useNavigate();
  const [searchParams]=useSearchParams();
  const categories = Array.isArray(user.categories)? user.categories:[];
  const [existingNote, setExistingNote] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [favourite, setFavourite] = useState(false);
  const [category, setCategory] = useState(null);


  useEffect(() => {
  if (!id) {
    setLoading(false);
    return;
  }

  let active = true;
  setLoading(true);
  setExistingNote(null);
  setError('');

  getNote(id)
    .then(({ note }) => {
      if (!active) return;

      setExistingNote(note);
      setTitle(note.title || '');
      setFavourite(Boolean(note.isFavourite));
      setCategory(note.category || null);
    })
    .catch((err) => {
      if (!active) return;

      setError(
        err.response?.data?.message || 'Could not load this note.'
      );
    })
    .finally(() => {
      if (active) {
        setLoading(false);
      }
    });

  return () => {
    active = false;
  };
}, [id]);

  useEffect(() => {
  if (id) {
    return;
  }

  const urlCategory = searchParams.get('category');

  if (urlCategory) {
    const matchingCategory = categories.find(
      (cat) => cat.toLowerCase() === urlCategory.toLowerCase()
    );

    if (matchingCategory) {
      setCategory(matchingCategory);
      return;
    }
    else{
      setCategory(null);
    }
  }
  setCategory(null);
}, [id, searchParams, categories]);

  const editor = useEditor({extensions:[ StarterKit.configure({ bulletList: {}, orderedList: {},blockquote: {},}),Underline,Link,Image,],
  content: "<p>Start writing...</p>",});
  useEffect(()=>{
    if(editor && existingNote){
      editor.commands.setContent(existingNote.content || "<p></p>");
    }
  }, [editor, existingNote]);
  const plainText = editor?.getText() || "";
  const words = plainText.trim()? plainText.trim().split(/\s+/).length: 0;
  const chars = plainText.length;
  const handleSaveNow = async() => {
    if(!editor){
      return;
    }
    setError('');
    setSaving(true);
    const payload = {
      title: title.trim(), category: category || null, content: editor.getHTML(), isFavourite: favourite,};
    try{
      if(existingNote){
        await updateNote(existingNote.id, payload);
      }
      else{
        await createNote(payload);
      }
      navigate('/notes');
    }
    catch(err){
      setError(err.response?.data?.message || 'Could not save the note.');
    }
    finally{
      setSaving(false);
    }
  };
  const handleNewCategory =async()=>{
    const name =window.prompt("Enter category name");
    const trimmed=name?.trim();
    if(!trimmed){
      return;
    }
    const existingCategory = categories.find((cat)=>cat.toLowerCase()===trimmed.toLowerCase());
    if(existingCategory){
      setCategory(existingCategory);
      return;
    }
    try{
      const updatedCategories = [...categories, trimmed];
      await updateMe({categories: updatedCategories});
      setCategory(trimmed);
      await refreshUser();
    }
    catch(err){
      setError(err.response?.data?.message || 'Could not create category.');
    }
  };
  const handleDeleteCategory=async(categoryToDelete)=>{
    const confirmed = window.confirm(`Are you sure you want to delete "${categoryToDelete}"?`);
    if(!confirmed){
      return;
    }
    const updatedCategories = categories.filter((cat)=> cat.toLowerCase() !== categoryToDelete.toLowerCase());
    try{
      await updateMe({categories: updatedCategories,});

    if(!existingNote && category && category.toLowerCase() === categoryToDelete.toLowerCase()){
      setCategory(null);
    }
    if(existingNote && existingNote.category && existingNote.category.toLowerCase() === categoryToDelete.toLowerCase()){
        await updateNote(existingNote.id, {category: null,});
        setExistingNote((prev)=>({...prev, category:null,}));
        setCategory(null);
    }
    await refreshUser();
  }
  catch(err){
    setError(err.response?.data?.message || 'Could not delete category.');
  }
};
  const insertLink=()=>{
    const url =window.prompt("Enter URL");
    if(!url || !editor){
        return;
    }
    editor?.chain().focus().setLink({ href: url }).run();};

  const insertImage = () => {
    const url = window.prompt("Paste image URL");
    if (!url||!editor) {
        return;
    }
    editor?.chain().focus().setImage({ src: url }).run();};

  const handleCancel=() =>{
    navigate("/notes");
  };
  const handleToggleFavourite =() =>{
    setFavourite((prev)=>!prev);
  };

  if (loading){
    return(
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-ink/50">
        Loading note...
      </div>
    );
  }

  if (!editor) {
    return null;
  }

    return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar categories={categories} onNewCategory={handleNewCategory} onDeleteCategory={handleDeleteCategory}/>
      <main className="flex-1 px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => navigate("/notes")} className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
            <ArrowLeft size={15} />Back to all notes
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleCancel} className="rounded-lg border border-black/10 px-4 py-1.5 text-sm hover:bg-sand/40">Cancel</button>
            <button onClick={handleSaveNow} disabled={saving} className="rounded-lg bg-clay px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">{saving?'Saving...':'Save Note'}</button>
            <button type="button" aria-label="More options" className="text-ink/40 hover:text-ink/70"><MoreHorizontal size={18} /></button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <div className="mb-4 flex items-center gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled Note"className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-ink/30"/>
          <div className="mb-4">
             <label htmlFor='category' className="mb-1 block text-sm font-medium text-ink/70">Category</label>
             <select id='category' value={category || ''} onChange={(e)=> {
              if(e.target.value === "__new__"){
                handleNewCategory();
              }
              else if(e.target.value === ''){
                setCategory(null);
              }
              else{
                setCategory(e.target.value);
              }
             }} className="w-64 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none">
              <option value=''>No Category</option>
              {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              <option value="__new__">+ New Category</option>
             </select>
          </div>
          <button type='button' aria-label='Toggle Favourite' aria-pressed={favourite} onClick={handleToggleFavourite} className="text-ink/30 hover:text-clay">
            <Star size={20} fill={favourite ? "#b08968" : "none"}className={favourite ? "text-clay" : ""}/>
          </button>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1.5">
          <ToolbarButton icon={Bold} label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}/>
          <ToolbarButton icon={Italic} label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}/>
          <ToolbarButton icon={underline_icon} label="Underline" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}/>
          <ToolbarButton icon={Strikethrough} label="Strike"active={editor?.isActive("strike")}onClick={() => editor?.chain().focus().toggleStrike().run()}/>
          <ToolbarButton icon={Code} label="Code" active={editor?.isActive("code")}onClick={() => editor?.chain().focus().toggleCode().run()} />
          <span className="mx-1 h-4 w-px bg-black/10" />
          <ToolbarButton icon={List} label="Bullet List" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}/>
          <ToolbarButton icon={ListOrdered} label="Numbered List" active={editor?.isActive("orderedList")}onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
          <ToolbarButton icon={Quote} label="Quote" active={editor?.isActive("blockquote")}onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
          <ToolbarButton icon={LinkIcon} label="Insert Link" onClick={insertLink}/>
          <ToolbarButton icon={ImageIcon}label="Insert Image" onClick={insertImage}/>
          <span className="ml-auto flex items-center gap-1">
            <ToolbarButton icon={Undo} label="Undo"onClick={() => editor.chain().focus().undo().run()}/>
            <ToolbarButton icon={Redo} label="Redo" onClick={() => editor.chain().focus().redo().run()}/>
          </span>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 min-h-[420px]">
          <EditorContent editor={editor} />
        </div>
        <p className="mt-3 text-xs text-ink/40">{words} words • {chars} characters</p>
      </main>
    </div>
  );
};

export default NoteEditor;
