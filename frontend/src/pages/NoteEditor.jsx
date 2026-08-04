import React, {useState} from "react";
import { Undo,ArrowLeft, Star, Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, CheckSquare, Link as LinkIcon, Image as ImageIcon, Quote, Minus, Redo, MoreHorizontal} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
const ToolbarButton = ({icon: Icon}) => (
    <button type='button' className="rounded-md p-1.5 text-ink/60 hover:bg-sand">
        <Icon size={15}/>
    </button>
);

const NoteEditor = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('shopping list');
    const [content, setContent] = useState('milk, eggs, bread\nThis is the sample content');
    const [favourite, setFavourite] = useState(false);
    const [saving, setSaving] =useState(false)
    const words= content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const handleSaveNow = ()=>{
        setSaving(true);
        setTimeout(()=>{
            setSaving(false);
            alert('save now button clicked');},1000);
        
    };
    const handleCancel =()=> {
        alert('cancel button clicked');
    };
    const handleToggleFavourite =()=> {
        setFavourite(!favourite);
    }
    return(
        <div className="flex min-h-screen bg-cream">
            <Sidebar/>
            <main className="flex-1 px-8 py-6">
                <div className="mb-4 flex items-center justify-between">
                    <button onClick={() => navigate('/notes')} className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
                        <ArrowLeft size={15} /> Back to all notes
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-ink/40"> {saving ? 'Saving...' : 'saved just now'}</span>
                        <button onClick={handleCancel} className="rounded-lg border border-black/10 px-4 py-1.5 text-sm hover:bg-sand/40">Cancel</button>
                        <button onClick={handleSaveNow} className="rounded-lg bg-clay px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">Save Note</button>
                        <button className='text-ink/40 hover:text-ink/70'><MoreHorizontal size={18}/></button>
                    </div>
                </div>
                <div className="mb-4 flex items-center gap-3">
                    <input value={title} onChange={(e)=> setTitle(e.target.value)} placeholder="Untitled Note" className='w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-ink/30'/>
                    <button onClick={handleToggleFavourite} className='text-ink/30 hover:text-clay'><Star size={20} fill ={favourite? '#b08968':'none'} className={favourite ? 'text-clay':''}/></button>

                </div>
                <div className="mb-3 flex flex-wrap items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1.5">
                    <ToolbarButton icon={Bold}/>
                    <ToolbarButton icon={Italic}/>
                    <ToolbarButton icon={Underline}/>
                    <ToolbarButton icon={Strikethrough}/>
                    <ToolbarButton icon={Code}/>
                    <span className ="mx-1 h-4 w-px bg-black/10"/>
                    <ToolbarButton icon={List}/>
                    <ToolbarButton icon={ListOrdered}/>
                    <ToolbarButton icon={CheckSquare}/>
                    <span className="mx-1 h-4 w-px bg-black/10"/>
                    <ToolbarButton icon={LinkIcon}/>
                    <ToolbarButton icon={ImageIcon}/>
                    <ToolbarButton icon={Quote}/>
                    <ToolbarButton icon={Minus}/>
                    <span className="ml-auto flex items-center gap-1">
                    <ToolbarButton icon ={Undo}/>
                    <ToolbarButton icon={Redo}/>
                    </span>
                </div>
                <textarea value={content} onChange={(e)=> setContent(e.target.value)} placeholder="Start writing..." className="min-h-[420px] w-full resize-none rounded-lg border border-black/10 bg-white p-4 text-sm leading-relaxed outline-none placeholder:text-ink/30"/>
                <p className="mt-3 text-xs text-ink/40">{words} words • {chars} characters</p>    
            </main>
        </div>
    );
};
export default NoteEditor;