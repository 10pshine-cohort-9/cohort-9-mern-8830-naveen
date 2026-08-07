import React, {useEffect, useState} from 'react';
import {Search, Plus, Lock} from 'lucide-react';
import { useSearchParams,useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
const VIEW_TITLES ={
    favourite :'Favourites',
    archived :'Archived',
    trashed :'Trash',
};

const Dashboard = () =>{
    const [categories, setCategories]=useState(()=>{const saved=localStorage.getItem("categories");
        return saved? JSON.parse(saved):["Personal", "Work", "Ideas", "Study"]});
    useEffect(()=>{ localStorage.setItem("categories", JSON.stringify(categories));},[categories]);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [searchParams] = useSearchParams();
    const selectedCat = searchParams.get('category');
    let currentView ='';
    if (searchParams.get('favourite')==='true'){
        currentView ='favourite'
    }
    else if (searchParams.get('archived')==='true'){
        currentView='archived'
    }
    else if(searchParams.get('trashed')==='true'){
        currentView='trashed';
    }
    const viewTitle =selectedCat||VIEW_TITLES[currentView]||'All Notes'
    const [activeMenu, setActiveMenu] =useState(null);
    const initialNotes =[
        {id: 1, title:'shopping list', content:'milk, eggs, bread',category: 'Personal', isFavourite: true, isArchived: false, isTrashed: false, updatedAt: new Date()},
        {id: 2, title:'workout plan', content: 'Monday: chest, Tuesday: back, Wednesday: legs', category: 'Study',isFavourite: false, isArchived: false, isTrashed: false, updatedAt: new Date()},
        {id: 3, title:'meeting notes', content: 'Discuss project timeline and deliverables', category:'Work',isFavourite: false, isArchived: true, isTrashed: false, updatedAt: new Date()},
    ];
    const [notes,setNotes] =useState(()=>{const saved =localStorage.getItem("notes");
        return saved? JSON.parse(saved):initialNotes;
    });
    useEffect(()=>{
        localStorage.setItem("notes",JSON.stringify(notes));
    },[notes]);
    const filteredNotes = notes.filter((note) => {const matchesSearch =note.title.toLowerCase().includes(search.toLowerCase()) ||note.content.toLowerCase().includes(search.toLowerCase());
        const matchesCat = !selectedCat || note.category === selectedCat;
        if (currentView === 'favourite') {
            return matchesSearch && matchesCat &&note.isFavourite && !note.isArchived && !note.isTrashed;
        }
        if (currentView === 'archived') {
            return matchesSearch && matchesCat&&note.isArchived && !note.isTrashed;
        }
        if (currentView === 'trashed') {
            return matchesSearch && matchesCat&& note.isTrashed;
        }
        return matchesSearch && matchesCat &&!note.isArchived&&!note.isTrashed;
    });    
    const handleRestore =(id)=>{
        setNotes((prev)=>prev.map((note)=> note.id=== id? {...note,isArchived: false,isTrashed:false}:note));
    };
    const handleDeleteForever=(id)=>{
        setNotes((prev)=>prev.filter((note)=> note.id!==id ));
    };
    const handleNewNote =()=> {
        navigate('/editor');
    };
    const handleOpenNote =(note) => {
        navigate(`/editor/${note.id}`);
    };
    const handleToggleFavourite =(note) => {
        setNotes((prev)=>prev.map((n)=>n.id===note.id?{...n,isFavourite:!n.isFavourite}:n));
    };
    const handleArchive=(id)=>{
        setNotes((prev)=> prev.map((note)=> note.id ===id?{...note,isArchived: !note.isArchived}:note));
    };
    const handleDelete=(id)=>{
        setNotes((prev)=>prev.map((note)=> note.id===id?{...note,isTrashed:true}:note));
    };
    return(
        
        <div className="flex min-h-screen bg-cream">
            <Sidebar categories={categories}onNewCategory={()=>{const newCat=prompt("Enter category name");
                if(newCat && !categories.includes(newCat.trim())){
                    setCategories([...categories,newCat.trim()]);
                }
            }}/>
            <main className="flex-1 px-8 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{viewTitle}</h1>
                        <p className="text-sm text-ink/50">{filteredNotes.length} notes</p>
                    </div>
                    <div className ="flex items-center gap-3">
                        <label className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
                            <Search size={15} className="text-ink/40"/>
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="w-48 bg-transparent text-sm outline-none placeholder:text-ink/40"/>
                        </label>
                        <button onClick={handleNewNote} className="flex items-center gap-1.5 rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:opacity-90"> <Plus size={16}/>New Note </button>
                    </div>
                </div>
                {filteredNotes.length === 0? (
                    <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-black/10 py-20 text-center '>
                        <p className='mb-1 text-sm font-medium text-ink/70'>no notes found</p>
                        <p className='mb-4 text-xs text-ink/40'>create a note to get started.</p>
                        <button onClick={handleNewNote} className ='flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90'><Plus size={16}/>Create Note</button>
                    </div> ): (
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                            {filteredNotes.map((note)=>(
                                <NoteCard key={note.id} note={note} onOpen={handleOpenNote} onToggleFavourite={handleToggleFavourite} activeMenu={activeMenu} setActiveMenu={setActiveMenu} onArchive={handleArchive} onDelete={handleDelete} onRestore={handleRestore} onDeleteForever={handleDeleteForever}/>    
                            ))}
                        </div>
                    )}
                    <p className='mt-10 flex items-center justify-center gap-1.5 text-xs text-ink/30'><Lock size={12}/>Only you can see your notes</p>
            </main>
        </div>
    );
};
export default Dashboard;