import React from "react";
import {render, screen, fireEvent} from '@testing-library/react';
import NoteCard from '../components/NoteCard';
const baseNote ={
    id:1,
    title:'Project Ideas',
    content: 'Some fresh ideas for upcoming projects and features',
    category: 'Work',
    isFavourite: false,
    updatedAt: '2024-05-19T00:00:00:000Z',
};
describe("NoteCard",()=>{
    it('renders the note title and a content preview',()=>{
        render(<NoteCard note={baseNote} onOpen={()=>{}} onToggleFavourite={()=>{}}/>);
        expect(screen.getByText('Project Ideas')).toBeInTheDocument();
        expect(screen.getByText(/Some fresh ideas/)).toBeInTheDocument();
    });
    it('calls onOpen when the card is clicked', ()=>{
        const onOpen =jest.fn();
        render(<NoteCard note={baseNote} onOpen={onOpen} onToggleFavourite={()=>{}}/>);
        fireEvent.click(screen.getByText("Project Ideas"));
        expect(onOpen).toHaveBeenCalledWith(baseNote);
    });
    it('calls onToggleFavourite without triggering onOpen', ()=>{
        const onOpen = jest.fn();
        const onToggleFavourite =jest.fn();
        render(<NoteCard note={baseNote} onOpen={onOpen} onToggleFavourite={onToggleFavourite}/>);
        fireEvent.click(screen.getByLabelText("Toggle Favourite"));
        expect(onToggleFavourite).toHaveBeenCalledWith(baseNote);
        expect(onOpen).not.toHaveBeenCalled();
    });
});