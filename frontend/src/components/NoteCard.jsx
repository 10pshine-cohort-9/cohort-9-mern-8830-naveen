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
const stripMarkdown = (text ='' ) => text
    .replace(/#{1,6}\s?/g, '')
    .replace(/[[*_`>-]/g, '')
    .trim();

const NoteCard = ({note, onOpen, onToggleFavourite}) => {
    return(
        <div
            onClick={()=> onOpen(note)}
            className='flex cursor-pointer flex flex-col rounded-xl border border-black/5 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'>
                <div className='mb-2 flex items-start justify-between gap-2'>
                    <h3 className='line-clamp-1 text-sm font-semibold text-ink'>{note.title}</h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavourite(note);
                        }}
                        className='text-ink/30 hover:text-clay'
                        aria-label='Toggle favourite'>
                            <Star size={16} fill={note.isFavourite ? '#b08968' : 'none'} className= {note.isFavourite? 'text-clay' : ''}/>
                        </button>
                </div>
                <p className='mb-4 line-clamp-2 flex-1 text-xs text-ink/60'>{stripMarkdown(note.content) || 'No additional content yet.'}</p>
                <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-1.5 text-xs text-ink/50'>
                        <span className={`h-1.5 w-1.5 rouded-full ${CATEGORY_DOTS[note.category] || CATEGORY_DOTS.Other}`}/>
                        {formatDate(note.updatedAt)}
                    </span>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className='text-ink/30 hover:text-ink/60'
                        aria-label='More options'>
                            <MoreHorizontal size={16}/>
                        </button>
                </div>
            </div>
    );
};
export default NoteCard;