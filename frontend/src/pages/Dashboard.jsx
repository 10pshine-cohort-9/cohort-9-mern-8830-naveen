import React, {useCallback, useEffect, useState,useRef} from 'react';
import {Search, Plus, Lock} from 'lucide-react';
import { useSearchParams,useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import {useAuth} from '../context/AuthContext'
import {updateMe} from '../api/auth'
import {deleteNote as apiDeleteNote, getNotes, updateNote as apiUpdateNote,} from '../api/notes';
const VIEW_TITLES ={
    favourite :'Favourites',
    archived :'Archived',
    trashed :'Trash',
};

const Dashboard = () =>{
    const {user, refreshUser} = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedCat = searchParams.get('category');
    let currentView = '';

    if (searchParams.get('favourite') === 'true') {
        currentView = 'favourite';
    } 
    else if (searchParams.get('archived') === 'true') {
        currentView = 'archived';
    } 
    else if (searchParams.get('trashed') === 'true') {
    currentView = 'trashed';
}    
    const canCreateNote = currentView === '';
    const isTrashView = currentView === 'trashed';
    const categories = user?.categories || [];
    const [search, setSearch] = useState('');
    const [notes,setNotes] =useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeMenu,setActiveMenu] =useState(null);
    const latestRequestRef = useRef(0);
    const fetchNotes =useCallback(async()=>{
        const requestId = ++latestRequestRef.current;
        setLoading(true);
        setError('');
        try{
            const {notes:serverNotes} = await getNotes({
                category: selectedCat || undefined, favourite: currentView=== 'favourite' ? 'true': undefined, archived: currentView==='archived' ? 'true' : undefined, trashed: currentView==='trashed' ? 'true':undefined, search: search.trim()||undefined,
            });
            if(requestId !== latestRequestRef.current){
                return;
            }
            setNotes(serverNotes || []);
        }
        catch(err){
            if(requestId !== latestRequestRef.current){
                return;
            }
            setError(err.response?.data?.message || 'Could not load notes.');
        }
        finally {
            if(requestId === latestRequestRef.current){
                setLoading(false);
            }
        }
    }, [selectedCat, currentView, search]);
    useEffect(()=>{
        fetchNotes();
    }, [fetchNotes]);
    const updateAndRefresh = async(id, payload)=>{
        try{
            await apiUpdateNote(id,payload);
            await fetchNotes();
        }
        catch(err){
            setError(err.response?.data?.message || 'Could not update the note.');
        }
    };

    const handleRestore =async(id)=>{
        try{
            await apiUpdateNote(id, {isDeleted: false, isArchived:false});
            await fetchNotes();
        }
        catch(err){
            setError(err.response?.data?.message || "Could not restore the note.");
        }
    };
    const handleNewNote =()=> {
        if(!canCreateNote){
            return;
        }
        if(selectedCat){
            navigate(`/editor?category=${encodeURIComponent(selectedCat)}`);
        }
        else{
            navigate('/editor');
        }
    };
    const handleOpenNote =(note) => {
        navigate(`/editor/${note.id}`);
    };
    const handleToggleFavourite =(note) => {
        updateAndRefresh(note.id, {isFavourite: !note.isFavourite});
    };
    const handleArchive=(id)=>{
        const note = notes.find((item)=>item.id === id);
        if(note){
            updateAndRefresh(id, {isArchived: !note.isArchived});
        }
    };
    const handleDelete = async(id)=>{
        try{
            await apiUpdateNote(id, {isDeleted: true, isArchived:false});
            await fetchNotes();
        }
        catch(err){
            setError(err.response?.data?.message || "Could not move the note to Trash");
        }
    };
    const handleDeleteForever = async(id)=>{
        try{
            await apiDeleteNote(id);
            await fetchNotes();
        }
        catch(err){
            setError(err.response?.data?.message || 'Could not permanently delete the note.');
        }
    };
    const handleNewCategory =async()=>{
        const newCat = window.prompt('Enter category name');
        const trimmed = newCat?.trim();
        if(!trimmed || categories.some((cat)=> cat.toLowerCase() === trimmed.toLowerCase())){
            return;
        }
        try{
            await updateMe({categories: [...categories,trimmed],});
            await refreshUser();
        }
        catch(err){
            setError(err.response?.data?.message || 'Could not create category.');
        }
    };
    const handleDeleteCategory = async(categoryToDelete)=>{
        const confirmed = window.confirm(`Are you sure you want to delete "${categoryToDelete}"?`);
        if(!confirmed){
            return;
        }
        try{
            const newCategories = categories.filter((cat)=>cat!== categoryToDelete);
            await updateMe({categories: newCategories,});
            await refreshUser();
        }
        catch(err){
            setError(err.response?.data?.message || 'Could not delete category.');
        }
    }
    const viewTitle = selectedCat || VIEW_TITLES[currentView] || 'All Notes';

    return(

        <div className="flex min-h-screen bg-cream">
            <Sidebar categories={categories}onNewCategory={handleNewCategory} onDeleteCategory={handleDeleteCategory}/>
            <main className="flex-1 px-8 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{viewTitle}</h1>
                        <p className="text-sm text-ink/50">{loading ? 'Loading...' : `${notes.length} notes`}</p>
                    </div>
                    <div className ="flex items-center gap-3">
                        <label className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
                            <Search size={15} className="text-ink/40"/>
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="w-48 bg-transparent text-sm outline-none placeholder:text-ink/40"/>
                        </label>
                        {canCreateNote && (
                            <button type='button' onClick={handleNewNote} className="flex items-center gap-1.5 rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:opacity-90"> <Plus size={16}/>New Note </button>
                        )}
                    </div>
                </div>
                {error &&(
                    <p role='alert' className='mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</p>
                )}
                {loading ? (
                    <div className='flex items-center justify-center py-20 text-sm text-ink/50'>Loading notes...</div>
                ): notes.length === 0?(
                    <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-black/10 py-20 text-center'>
                        <p className='mb-1 text-sm font-medium text-ink/70'>{currentView === 'favourite' ? 'No favourite notes' : currentView === 'archived' ? 'No archived notes' : currentView === 'trashed' ? 'Trash is empty' : selectedCat? `No notes in ${selectedCat}`: 'No notes available'}</p>
                        <p className='mb-4 text-xs text-ink/40'>{currentView === 'favourite' ? 'Notes you mark as favourite will appear here' : currentView === 'archived' ? 'Notes you archive will appear here' : currentView === 'trashed' ? 'Deleted notes will appear here' : selectedCat? `Create a note in ${selectedCat} to get started.`: 'Create a note to get started.'}</p>
                        {canCreateNote && (
                            <button type='button' onClick={handleNewNote} className ='flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90'><Plus size={16}/>Create Note</button>
                        )}

                    </div>
                ): (
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>{notes.map((note)=>(<NoteCard key={note.id} note={note} onOpen={handleOpenNote} onToggleFavourite={handleToggleFavourite} activeMenu={activeMenu} setActiveMenu={setActiveMenu} onArchive={isTrashView? undefined : handleArchive} onDelete={isTrashView ? undefined:handleDelete} onRestore={isTrashView? handleRestore: undefined} onDeleteForever={isTrashView? handleDeleteForever:undefined}/>))}</div>
                )}
                    <p className='mt-10 flex items-center justify-center gap-1.5 text-xs text-ink/30'><Lock size={12}/>Only you can see your notes</p>
            </main>
        </div>
    );
};
export default Dashboard;
