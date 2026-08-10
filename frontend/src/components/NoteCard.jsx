import React from 'react';
import {Star, MoreHorizontal} from 'lucide-react';
const CATEGORY_DOTS ={
    Personal: 'bg-orange-300',
    Work: 'bg-blue-300',
    Ideas: 'bg-green-300',
    Study: 'bg-purple-300',
    Other: 'bg-gray-300',
};

const formatDate =(iso) => new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
const stripHtml=(html= "")=>{
  const div=document.createElement("div");
  div.innerHTML=html;
  return div.textContent|| "";
};
const NoteCard = ({note, onOpen, onToggleFavourite, activeMenu, setActiveMenu, onArchive,onDelete,onRestore,onDeleteForever}) => {
    return(
        <div className='relative flex flex-col rounded-xl border border-black/5 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'>
                <div className='mb-2 flex items-start justify-between gap-2'>
                    <button type='button' onClick={()=> onOpen?.(note)} className='line-clamp-1 text-sm font-semibold text-ink'>{note.title}</button>
                    <button type='button' onClick={(e) => {e.stopPropagation(); onToggleFavourite?.(note);}} className='text-ink/30 hover:text-clay' aria-label={note.isFavourite? 'Remove from favourites' : 'Add to favourites'} aria-pressed={note.isFavourite}>
                            <Star size={16} fill={note.isFavourite ? '#b08968' : 'none'} className= {note.isFavourite? 'text-clay' : ''}/>
                        </button>
                </div>
                <button type='button' onClick={()=> onOpen?.(note)} className='mb-4 flex-1 text-left text-xs text-ink/60 line-clamp-2'>{stripHtml(note.content) || 'No additional content yet.'}</button>
                
                <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-1.5 text-xs text-ink/50'>
                        <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOTS[note.category] || CATEGORY_DOTS.Other}`}/>
                        {formatDate(note.updatedAt)}
                    </span>
                    <div className='relative'>
                    <button type='button'onClick={(e) =>{ e.stopPropagation(); if (activeMenu === note.id){setActiveMenu(null);} else {setActiveMenu(note.id);}}} className='text-ink/30 hover:text-ink/60' aria-label='More options'><MoreHorizontal size={16}/></button>
                    {activeMenu === note.id && (
                        <div className='absolute right-0 top-7 z-20 w-40 rounded-lg border border-black/10 bg-white shadow-lg'>
                            {note.isTrashed? (<>
                            <button type='button' className='block w-full px-4 py-2 text-left text-sm hover:bg-sand/40' onClick={()=>{onRestore?.(note.id); setActiveMenu(null)}}>Restore</button>
                            <button type='button' className='block w-full px-4 py-2 text-left text-sm hover:bg-sand/40' onClick={()=>{onDeleteForever?.(note.id); setActiveMenu(null)}}>Delete Forever</button>
                            </>):(
                                <>
                                <button type='button' className='block w-full px-4 py-2 text-left text-sm hover:bg-sand/40' onClick={()=>{onArchive?.(note.id); setActiveMenu(null);}}>{note.isArchived? "Unarchive":"Archive"}</button>
                                <button type='button' className='block w-full px-4 py-2 text-left text-sm hover:bg-sand/40' onClick={()=>{onDelete?.(note.id); setActiveMenu(null);}}>Delete</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                </div>
            </div>
    );
};
export default NoteCard;