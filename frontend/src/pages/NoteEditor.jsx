import React, {useEffect, useMemo, useRef,useState} from "react";
import {ArrowLeft,Star,Bold,Italic,Underline as underline_icon,Strikethrough,Code,List,ListOrdered,Link as LinkIcon,Quote,Redo,Undo,MoreHorizontal,X, Trash2, Plus, AlertTriangle, ExternalLink} from "lucide-react";
import '../editor.css';
import Sidebar from "../components/Sidebar";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {createNote, getNote, updateNote} from '../api/notes';
import {useAuth} from '../context/AuthContext';
import { updateMe } from "../api/auth";


const ToolbarButton = ({ icon: Icon, label, onClick, active }) => (
  <button type="button" onClick={onClick} aria-label={label} title={label} className={`rounded-md p-1.5 transition ${ active ? "bg-clay text-white": "text-ink/60 hover:bg-sand"}`}>
    <Icon size={15} />
  </button>
);
const ModalOverlay = ({ children, onClose, titleId }) => {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const previousActiveElement = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    previousActiveElement.current = document.activeElement;
    const overlay = overlayRef.current;
    const dialog = dialogRef.current;
    if(!overlay || !dialog){
      return undefined;
    }
    const parent = overlay.parentElement;
    const siblings = parent? Array.from(parent.children).filter((child) => child !== overlay): [];
    siblings.forEach((sibling) => sibling.setAttribute("inert", ""));
    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll(['button:not([disabled])', 'input:not([disabled])','select:not([disabled])','textarea:not([disabled])','a[href]','[tabindex]:not([tabindex="-1"])',].join(",")));
    const firstFocusableElement = getFocusableElements()[0];
    firstFocusableElement?.focus();
    const handleKeyDown = (event) => {
      if(event.key === "Escape"){
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if(event.key !== "Tab"){
        return;
      }
      const focusableElements = getFocusableElements();
      if (!focusableElements.length){
        event.preventDefault();
        return;
      }
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if(event.shiftKey &&document.activeElement === firstElement){
        event.preventDefault();
        lastElement.focus();
      }
      else if(!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return()=>{
      document.removeEventListener("keydown", handleKeyDown);
      siblings.forEach((sibling) => {sibling.removeAttribute("inert");});
      if(previousActiveElement.current instanceof HTMLElement){
        previousActiveElement.current.focus();
      }
    };
  }, []);
  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" aria-label="Close modal" className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"onClick={onClose}/>
      <div ref={dialogRef} role="dialog" aria-modal="true"aria-labelledby={titleId} className="relative z-10">
        {children}
      </div>
    </div>
  );
};
const NoteEditor=()=>{
  const {user, refreshUser} = useAuth();
  const {id} =useParams();
  const navigate = useNavigate();
  const [searchParams]=useSearchParams();
  const categories =useMemo(()=> (Array.isArray(user?.categories)? user.categories:[]),[user?.categories]);
  const [existingNote, setExistingNote] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [favourite, setFavourite] = useState(false);
  const [category, setCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryDeleting, setCategoryDeleting] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');


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

  const editor = useEditor({immediatelyRender: false, extensions:[ StarterKit,Underline,Link.configure({openOnClick: false}),],
  content: "<p></p>",});
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
  const handleNewCategory =()=>{
    setNewCategoryName('');
    setCategoryError('');
    setShowCategoryModal(true);
  };
  const handleCreateCategory = async()=>{
    const trimmed = newCategoryName.trim();
    if(!trimmed){
      setCategoryError("Category name is required.");
      return;
    }
    const existingCategory = categories.find((cat)=>cat.toLowerCase()===trimmed.toLowerCase());
    if(existingCategory){
      setCategory(existingCategory);
      setShowCategoryModal(false);
      setNewCategoryName('');
      return;
    }
    try{
      setCategorySaving(true);
      setCategoryError('');

      const updatedCategories = [...categories, trimmed];
      
      await updateMe({categories: updatedCategories});
      setCategory(trimmed);
      await refreshUser();
      setShowCategoryModal(false);
      setNewCategoryName('');
    }
    catch(err){
      setCategoryError(err.response?.data?.message || 'Could not create category.');
    }
    finally{
      setCategorySaving(false);
    }
  };
  const handleDeleteCategory = (categoryName)=>{
    setCategoryToDelete(categoryName);
    setShowDeleteCategoryModal(true);
  };
  const confirmDeleteCategory=async()=>{
    if(!categoryToDelete){
      return;
    }
    try{
      setCategoryDeleting(true);
      setError('');
      const updatedCategories = categories.filter((cat)=> cat.toLowerCase() !== categoryToDelete.toLowerCase());
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
    setShowDeleteCategoryModal(false);
    setCategoryToDelete(null);
  }
  catch(err){
    setError(err.response?.data?.message || 'Could not delete category.');
  }
  finally{
    setCategoryDeleting(false);
  }
};
  const insertLink=()=>{
    if(!editor){
        return;
    }
    setLinkUrl('');
    setLinkError('');
    setShowLinkModal(true);
  };
  const handleInsertLink = ()=>{
    const trimmedUrl = linkUrl.trim();
    if(!trimmedUrl){
      setLinkError('Please enter a URL.');
      return;
    }
    try{
      new URL(trimmedUrl);
    }
    catch{
      setLinkError('Please enter a valid URL, e.g. https://example.com');
      return;
    }
    editor?.chain().focus().setLink({ href: trimmedUrl }).run();
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkError('');
  };

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

    return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar categories={categories} onNewCategory={handleNewCategory} onDeleteCategory={handleDeleteCategory}/>
      <main className="flex-1 px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => navigate("/notes")} className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
            <ArrowLeft size={15} />Back to all notes
          </button>
          <div className="flex items-center gap-3">
            <button type="button" aria-label='Cancel note' onClick={handleCancel} className="rounded-lg border border-black/10 px-4 py-1.5 text-sm hover:bg-sand/40">Cancel</button>
            <button type="button" onClick={handleSaveNow} disabled={saving || !editor} className="rounded-lg bg-clay px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">{saving?'Saving...':'Save Note'}</button>
            <button type="button" aria-label="More options" className="text-ink/40 hover:text-ink/70"><MoreHorizontal size={18} /></button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <div className="mb-4 flex items-center gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled Note"className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-ink/30"/>
          <div className="mb-4">
             <label htmlFor='category' className="mb-1 block text-sm font-medium text-ink/70">category</label>
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
          <span className="ml-auto flex items-center gap-1">
            <ToolbarButton icon={Undo} label="Undo"onClick={() => editor?.chain()?.focus()?.undo()?.run()}/>
            <ToolbarButton icon={Redo} label="Redo" onClick={() => editor?.chain()?.focus()?.redo()?.run()}/>
          </span>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 min-h-[420px]">
          <EditorContent editor={editor} />
        </div>
        <p className="mt-3 text-xs text-ink/40">{words} words • {chars} characters</p>
      </main>
      {showCategoryModal && (
        <ModalOverlay onClose={()=>{if(!categorySaving){setShowCategoryModal(false);}}} titleId="new-category-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 id="new-category-title" className="text-lg font-semibold text-ink">New Category</h2>
                <p className="mt-1 text-sm text-ink/50">Create a category for your notes.</p>
              </div>
              <button type="button" disabled={categorySaving} onClick={()=>setShowCategoryModal(false)} className="rounded-md p-1 text-ink/40 hover:bg-sand hover:text-ink disabled:opacity-50"><X size={18}/></button>
            </div>
            <label htmlFor="new-category" className="mb-1.5 block text-sm font-medium text-ink/70">Category name</label>
            <input id="new-category" autoFocus value={newCategoryName} onChange={(e)=>{setNewCategoryName(e.target.value); setCategoryError('');}} onKeyDown={(e)=>{if(e.key==='Enter'){handleCreateCategory();} if(e.key==='Escape'){if(!categorySaving){setShowCategoryModal(false);}}}} placeholder="e.g. Work" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-clay"/>
            {categoryError && (
              <p className="mt-2 text-sm text-red-600">{categoryError}</p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" disabled={categorySaving} onClick={()=> setShowCategoryModal(false)} className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-sand/40 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={categorySaving} onClick={handleCreateCategory} className="flex items-center gap-2 rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"><Plus size={15}/>{categorySaving? 'Creating...' : "Create Category"}</button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {showDeleteCategoryModal && categoryToDelete && (
        <ModalOverlay onClose={() => {if (!categoryDeleting) {
              setShowDeleteCategoryModal(false);
              setCategoryToDelete(null);
            }}} titleId="delete-category-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"><AlertTriangle size={20}/></div>
              <div className="flex-1">
                <h2 id="delete-category-title" className="text-lg font-semibold text-ink">Delete Category?</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">Are you sure you want to delete{" "}<span className="font-medium text-ink">"{categoryToDelete}"</span> ? This category will be removed from your category list.</p>
              </div>
              <button type="button" disabled={categoryDeleting} onClick={()=> {
                  setShowDeleteCategoryModal(false);
                  setCategoryToDelete(null);
                }}className="rounded-md p-1 text-ink/40 hover:bg-sand hover:text-ink disabled:opacity-50"><X size={18} /></button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" disabled={categoryDeleting} onClick={() => {
                  setShowDeleteCategoryModal(false);
                  setCategoryToDelete(null);}} className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-sand/40 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={categoryDeleting} onClick={confirmDeleteCategory} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"> <Trash2 size={15} />{categoryDeleting? "Deleting...": "Delete Category"}</button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {showLinkModal && (
        <ModalOverlay onClose={() => {setShowLinkModal(false);setLinkUrl("");setLinkError("");}} titleId="insert-link-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 id="insert-link-title" className="text-lg font-semibold text-ink">Insert Link</h2>
                <p className="mt-1 text-sm text-ink/50">Enter the URL you want to link to.</p>
              </div>
              <button type="button" onClick={() => { setShowLinkModal(false); setLinkUrl(""); setLinkError("");}}className="rounded-md p-1 text-ink/40 hover:bg-sand hover:text-ink"><X size={18} /></button>
            </div>
            <label htmlFor="link-url"className="mb-1.5 block text-sm font-medium text-ink/70">URL</label>
            <input id="link-url" aria-label="URL" autoFocus value={linkUrl} onChange={(e) => {
                setLinkUrl(e.target.value);
                setLinkError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleInsertLink();
                }
                if (e.key === "Escape") {
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setLinkError('');
                }
              }}placeholder="https://example.com"className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-clay"/>
            {linkError && (
              <p className="mt-2 text-sm text-red-600">{linkError} </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl("");
                  setLinkError("");
                }}className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-sand/40">Cancel</button>
              <button type="button" onClick={handleInsertLink}className="flex items-center gap-2 rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:opacity-90"><ExternalLink size={15} /> Insert Link</button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};
export default NoteEditor;