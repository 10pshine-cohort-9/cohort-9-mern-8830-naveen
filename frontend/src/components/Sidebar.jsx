import React, { useState } from 'react';
import { NavLink, useNavigate,useSearchParams } from 'react-router-dom';
import {FileText, Star, Archive, Trash2, Plus, ChevronDown, Feather, User, LogOut} from 'lucide-react';

const CATEGORY_DOTS = {
    Personal: 'bg-orange-300',
    Work: 'bg-blue-300',
    Ideas: 'bg-green-300',
    Study: 'bg-purple-300',
};
const navItemClass =(active) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-sand text-ink font-medium' : 'text-ink/70 hover:bg-sand/60'}`;

const Sidebar = ({categories =['Personal', 'Work', 'Ideas', 'Study'], onNewCategory}) => {
    const navigate = useNavigate();
    const [searchParams] =useSearchParams();
    const category = searchParams.get("category");
    const favourite = searchParams.get("favourite") === "true";
    const archived = searchParams.get("archived")==="true";
    const trashed =searchParams.get("trashed")==="true";
    const [showMenu, setShowMenu]  =useState(false);
    const user = {
        fullName: "Naveen Fatima",
    };
    const handleLogout =()=> {
        navigate('/login');
    };
    return (
        <aside className="flex h-screen w-64 shrink-0 flex flex-col justify-between border-r border-black/5 bg-white/60 px-4 py-6">
            <div>
                <div className="mb-8 flex items-center gap-2 px-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand text-ink">
                        <Feather size={16}/>
                    </span>
                    <span className="text-lg font-semibold">Notes</span>
                </div>

                <nav className="flex flex-col gap-1">
                    <NavLink to="/notes" className={() => navItemClass(!favourite && !archived && !trashed&& !category)}>
                        <FileText size={16}/> All Notes
                    </NavLink>
                    <NavLink to="/notes?favourite=true" className={() => navItemClass(favourite)}>
                        <Star size={16} /> Favourites
                    </NavLink>
                    <NavLink to="/notes?archived=true" className={() => navItemClass(archived)}>
                        <Archive size={16} /> Archived
                    </NavLink>
                    <NavLink to="/notes?trashed=true" className={() => navItemClass(trashed)}>
                        <Trash2 size={16} /> Trash
                    </NavLink>
                </nav>

                <div className="mt-8">
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-ink/40">Categories</p>
                    <div className="flex flex-col gap-1">
                        {categories.map((cat) => (
                            <button key={cat} onClick={()=> navigate(`/notes?${new URLSearchParams({category: cat})}`)} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${category === cat? "bg-sand text-ink font-medium": "text-ink/70 hover:bg-sand/60"}`}>
                                <span className={`h-2 w-2 rounded-full ${CATEGORY_DOTS[cat] || 'bg-ink/30'}`}/> {cat}
                            </button>
                        ))}
                        <button onClick={()=>onNewCategory?.()} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-clay hover:bg-sand/60"><Plus size={16}/> New Category</button>
                    </div>
                </div>
            </div>
            <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex w-full items-center gap-3 rounded-xl bg-sand/40 p-3 hover:bg-sand" >
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.fullName)}`} alt={user.fullName} className="h-10 w-10 rounded-full border border-white bg-white"/>
                <div className="flex-1 text-left">
                    <p className="truncate text-sm font-medium">{user.fullName}</p>
                </div>
                <ChevronDown size={15} /></button>

            {showMenu && (
                <div className="absolute bottom-16 left-0 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg">
                    <button onClick={() => navigate("/profile")} className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-sand/50"><User size={16} />View Profile</button>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} />Log Out</button>
                </div>
            )}
            </div>
        </aside>
    );
};
export default Sidebar;