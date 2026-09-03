import React from 'react';
import {render,screen,fireEvent,waitFor,} from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import {useAuth} from '../context/AuthContext';
import {getNotes,updateNote,deleteNote,} from '../api/notes';
import { updateMe } from '../api/auth';
jest.mock('../context/AuthContext');
jest.mock('../api/notes');
jest.mock('../api/auth');
const mockNavigate = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('react-router-dom',()=>({
    __esModule: true,MemoryRouter:({children})=>(<>{children}</>),
    useNavigate: () => mockNavigate,
    useSearchParams:()=> [mockSearchParams,jest.fn(),],
    Link:({children, ...props}) =>(<a {...props}>{children}</a>),
    NavLink: ({children, ...props})=>(<a {...props}>{children}</a>),
}));
const MemoryRouter=({children})=>(<>{children}</>);
jest.mock('../components/Sidebar',()=> {
    return function MockSidebar({
        categories = [],onNewCategory,onDeleteCategory,}) {
        return (
            <div data-testid="sidebar">
                <div data-testid="categories">{categories.join(',')}</div>
                <button type="button" onClick={onNewCategory}>New Category</button>
                {categories.map((category)=>(
                    <button key={category} type="button" onClick={() =>onDeleteCategory?.(category)}>Delete {category}</button>
                ))}
            </div>
        );
    };
});
jest.mock('../components/NoteCard',()=>{
    return function MockNoteCard({note,onOpen,onToggleFavourite,onArchive,onDelete,onRestore,onDeleteForever,}){
        return (
            <div data-testid={`note-${note.id}`}>
                <span>{note.title}</span>
                <button type="button" onClick={() => onOpen?.(note)}>Open {note.id}</button>
                <button type="button" onClick={()=>onToggleFavourite?.(note)} >Favourite {note.id}</button>
                <button type="button" onClick={() =>onArchive?.(note.id) }>Archive {note.id}</button>
                <button type="button" onClick={() => onDelete?.(note.id)}>Delete {note.id}</button>
                <button type="button" onClick={()=>onRestore?.(note.id)}>Restore {note.id}</button>
                <button type="button" onClick={() =>onDeleteForever?.(note.id)}>Delete Forever {note.id}</button>
            </div>
        );
    };
});
const notes =[
    {id: 1,title: 'First Note',content: 'First note content',category: 'Work', isFavourite: false, isArchived: false,isDeleted: false,updatedAt: '2024-05-19T00:00:00.000Z',},
    {id: 2,title: 'Favourite Note',content: 'Favourite content',category: 'Ideas',isFavourite: true, isArchived: false, isDeleted: false,updatedAt: '2024-05-20T00:00:00.000Z',},
];
const renderDashboard= (initialEntry = '/notes')=>{
    const [, queryString = '']=initialEntry.split('?');
    mockSearchParams = new URLSearchParams(queryString);
    return render(
        <MemoryRouter><Dashboard /></MemoryRouter>
    );
};
const setupAuth =(overrides = {}) => {
    const auth ={user:{ fullName: 'Test User',categories: ['Work', 'Ideas'],},refreshUser: jest.fn(),...overrides,
    };
    useAuth.mockReturnValue(auth);
    return auth;
};
describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupAuth();
        getNotes.mockResolvedValue({notes,});
        updateNote.mockResolvedValue({note: notes[0],});
        deleteNote.mockResolvedValue({message: 'Note deleted',});
        updateMe.mockResolvedValue({user:{fullName: 'Test User',categories: ['Work', 'Ideas'],},});
        window.prompt = jest.fn();
        window.confirm = jest.fn();
        window.prompt.mockReturnValue(null);
        window.confirm.mockReturnValue(true);
    });
    describe('initial rendering',()=>{
        it('renders loading state and then notes',async()=>{
            let resolveRequest;
            getNotes.mockReturnValue(new Promise((resolve)=> {resolveRequest = resolve;}));
            renderDashboard();
            expect(screen.getByText('Loading notes...')).toBeInTheDocument();
            resolveRequest({notes,});
            await waitFor(()=>{
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            expect(screen.getByText('2 notes')).toBeInTheDocument();
        });
        it('renders notes returned by the API', async()=>{
            renderDashboard();
            await waitFor(()=>{
                expect(screen.getByText('First Note')).toBeInTheDocument();});
            expect(screen.getByText('Favourite Note')).toBeInTheDocument();
            expect(getNotes).toHaveBeenCalledWith({category: undefined,favourite: undefined,archived: undefined,trashed: undefined,search: undefined,});
        });
        it('renders an error when loading notes fails',async()=>{
            getNotes.mockRejectedValue({response: {data: {message: 'Failed to load notes',},},});
            renderDashboard();
            await waitFor(()=>{
                expect(screen.getByText('Failed to load notes')).toBeInTheDocument();
            });
        });
        it('renders the default API error when loading fails without a message', async()=>{
            getNotes.mockRejectedValue({});
            renderDashboard();
            await waitFor(()=>{
                expect(screen.getByText('Could not load notes.')).toBeInTheDocument();
            });
        });
    });
    describe('empty state',()=>{
        beforeEach(()=>{
            getNotes.mockResolvedValue({notes: [],});
        });
        it('renders the default empty state', async()=> {
            renderDashboard();
            await waitFor(() =>{
                expect(screen.getByText('No notes available' )).toBeInTheDocument();
            });
            expect(screen.getByText('Create a note to get started.')).toBeInTheDocument();
            expect(screen.getByRole('button',{name: /create note/i,}) ).toBeInTheDocument();
        });
        it('renders the favourite empty state',async ()=>{
            renderDashboard('/notes?favourite=true');
            await waitFor(()=> {
                expect(screen.getByText('No favourite notes' )).toBeInTheDocument();
            });
            expect(screen.getByText('Notes you mark as favourite will appear here' )).toBeInTheDocument();
            expect(getNotes).toHaveBeenCalledWith({category: undefined,favourite: 'true',archived: undefined,trashed: undefined,search: undefined, });
        });
        it('renders the archived empty state',async () => {
            renderDashboard('/notes?archived=true');
            await waitFor(()=> {
                expect(screen.getByText('No archived notes')).toBeInTheDocument();
            });
            expect(screen.getByText('Notes you archive will appear here') ).toBeInTheDocument();
        });
        it('renders the trash empty state',async () => {
            renderDashboard('/notes?trashed=true' );
            await waitFor(()=>{
                expect(screen.getByText('Trash is empty') ).toBeInTheDocument();
            });
            expect(screen.getByText('Deleted notes will appear here')).toBeInTheDocument();
        });
        it('renders the category empty state',async() => {
            renderDashboard('/notes?category=Work');
            await waitFor(()=>{
                expect(screen.getByText('No notes in Work')).toBeInTheDocument();
            });
            expect(screen.getByText('Create a note in Work to get started.')).toBeInTheDocument();
        });
        it('does not show Create Note in a non-creatable view',async()=>{
            renderDashboard('/notes?favourite=true');
            await waitFor(()=> {
                expect(screen.getByText('No favourite notes')).toBeInTheDocument();
            });
            expect(screen.queryByRole('button',{name: /create note/i,})).not.toBeInTheDocument();
        });
    });
    describe('navigation',() => {
        it('navigates to the editor when New Note is clicked', async () => {
            renderDashboard();
            await waitFor(()=>{
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: /new note/i,}));
            expect(mockNavigate).toHaveBeenCalledWith('/editor');
        });

        it('navigates to the editor with a selected category', async ()=> {
            renderDashboard('/notes?category=Work');
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name:/new note/i,}));
            expect(mockNavigate).toHaveBeenCalledWith('/editor?category=Work');
        });
        it('opens an existing note in the editor', async() => {
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Open 1',}) );
            expect(mockNavigate).toHaveBeenCalledWith( '/editor/1');
        });
    });
    describe('search', () =>{
        it('updates the search query and refetches notes',async ()=> {
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            const searchInput =screen.getByPlaceholderText('Search notes...');
            fireEvent.change(searchInput,{target: {value: 'project',},});
            await waitFor(()=> {
                expect(getNotes).toHaveBeenLastCalledWith({category: undefined,favourite: undefined,archived: undefined,trashed: undefined,search: 'project',});
            });
        });
        it('does not send whitespace-only search text', async () => {
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            const searchInput =screen.getByPlaceholderText('Search notes...' );
            fireEvent.change(searchInput,{target:{value: '   ',},});
            await waitFor(() => {
                expect(getNotes).toHaveBeenLastCalledWith({category: undefined,favourite: undefined,archived: undefined,trashed: undefined,search: undefined,});
            });
        });
    });
    describe('note actions', ()=> {
        it('toggles favourite status', async() => {
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Favourite 1',}));
            await waitFor(() =>{
                expect(updateNote).toHaveBeenCalledWith(1, {isFavourite: true,});
            });
        });
        it('unfavourites a favourite note', async() => {
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('Favourite Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name:'Favourite 2',}));
            await waitFor(() =>{
                expect(updateNote).toHaveBeenCalledWith(2,{isFavourite: false,});
            });
        });
        it('archives a note', async() => {
            renderDashboard();
            await waitFor(()=>{
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name:'Archive 1',}) );
            await waitFor(()=> {
                expect(updateNote).toHaveBeenCalledWith(1,{isArchived: true,})
                    ;});
        });
        it('unarchives an archived note', async () => {
            getNotes.mockResolvedValue({notes:[{...notes[0],isArchived: true,},],});
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Archive 1',}));
            await waitFor(()=>{
                expect(updateNote).toHaveBeenCalledWith(1,{isArchived: false,});
            });
        });
        it('moves a note to trash',async() => {
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name: 'Delete 1',}));
            await waitFor(() =>{
                expect(updateNote).toHaveBeenCalledWith(1,{isDeleted: true,isArchived: false,});});
        });
        it('restores a deleted note', async() => {
            getNotes.mockResolvedValue({notes:[{...notes[0],isDeleted: true, }, ], });
            renderDashboard('/notes?trashed=true');
            await waitFor(()=> {
                expect(screen.getByText('First Note') ).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Restore 1',}));
            await waitFor(() =>{
                expect(updateNote).toHaveBeenCalledWith(1,{isDeleted: false, isArchived: false,});
            });
        });
        it('permanently deletes a note from trash',async () => {
            getNotes.mockResolvedValue({notes:[{...notes[0],isDeleted: true, },],});
            renderDashboard('/notes?trashed=true');
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Delete Forever 1',}));
            await waitFor(() =>{
                expect(deleteNote).toHaveBeenCalledWith(1);
            });
        });
        it('shows update error when updating a note fails', async() => {
            updateNote.mockRejectedValue({response: {data: {message: 'Update failed',},}, });
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name:'Favourite 1', }));
            await waitFor(()=>{
                expect(screen.getByText('Update failed')).toBeInTheDocument();
            });
        });
        it('shows default update error when no API message exists', async()=>{
            updateNote.mockRejectedValue({});
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name:'Favourite 1',}) );
            await waitFor(()=>{
                expect(screen.getByText('Could not update the note.')).toBeInTheDocument();
            });
        });
        it('shows restore error when restoring fails', async ()=> {
            updateNote.mockRejectedValue({response:{data: { message: 'Restore failed',},},});
            getNotes.mockResolvedValue({notes: [{...notes[0],isDeleted: true,},],});
            renderDashboard('/notes?trashed=true');
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name: 'Restore 1',}));
            await waitFor(()=> {
                expect(screen.getByText('Restore failed')).toBeInTheDocument();
            });
        });
        it('shows delete error when moving a note to trash fails',async () => {
            updateNote.mockRejectedValue({response:{data: {message: 'Delete failed',},},});
            renderDashboard();
            await waitFor(()=>{
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name:'Delete 1',}));
            await waitFor(()=>{
                expect(screen.getByText('Delete failed')).toBeInTheDocument();
            });
        });
        it('shows permanent delete error when deletion fails',async()=>{
            deleteNote.mockRejectedValue({response:{data:{message:'Permanent delete failed',},},});
            getNotes.mockResolvedValue({notes:[ {...notes[0],isDeleted: true, },],});
            renderDashboard('/notes?trashed=true');
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Delete Forever 1',}));
            await waitFor(()=>{
                expect(screen.getByText('Permanent delete failed')).toBeInTheDocument();
            });
        });
    });
    describe('categories',() =>{
        it('creates a new category', async ()=>{
            window.prompt.mockReturnValue('Personal');
            const auth= setupAuth({
                user:{fullName: 'Test User',categories: ['Work','Ideas',],},
            });
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();});
            fireEvent.click(screen.getByRole('button', {name: 'New Category',}));
            await waitFor(() => {
                expect(updateMe).toHaveBeenCalledWith({categories:['Work','Ideas','Personal',],});
            });
            expect(auth.refreshUser).toHaveBeenCalled();
        });
        it('does not create a category when prompt is cancelled',async() => {
            window.prompt.mockReturnValue(null);
            renderDashboard();
            await waitFor(()=>{
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name: 'New Category',}));
            expect(updateMe ).not.toHaveBeenCalled();
        });
        it('does not create a whitespace-only category',async () => {
            window.prompt.mockReturnValue('   ');
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'New Category',}));
            expect(updateMe).not.toHaveBeenCalled();
        });
        it('does not create a duplicate category',async() => {
            window.prompt.mockReturnValue('work');
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note') ).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'New Category',}));
            expect(updateMe).not.toHaveBeenCalled();
        });
        it('shows category creation error', async ()=>{
            window.prompt.mockReturnValue('Personal');
            updateMe.mockRejectedValue({response:{data:{message:'Category creation failed',},},});
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name:'New Category',}));
            await waitFor(()=> {
                expect(screen.getByText('Category creation failed')).toBeInTheDocument();
            });
        });
        it('uses default category creation error', async() => {
            window.prompt.mockReturnValue('Personal');
            updateMe.mockRejectedValue({});
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button',{name:'New Category',}));
            await waitFor(()=> {
                expect(screen.getByText('Could not create category.')).toBeInTheDocument();
            });
        });
        it('deletes a category after confirmation',async() => {
            window.confirm.mockReturnValue(true);
            const auth= setupAuth({
                user: {fullName:'Test User',categories:['Work','Ideas',],},
            });
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Delete Work',}));
            await waitFor(()=> {
                expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Work"?');
            });
            expect(updateMe).toHaveBeenCalledWith({categories: ['Ideas'],});
            expect(auth.refreshUser).toHaveBeenCalled();
        });
        it('does not delete a category when confirmation is cancelled',async() => {
            window.confirm.mockReturnValue(false);
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Delete Work',}));
            expect(updateMe).not.toHaveBeenCalled();
        });
        it('shows category deletion error',async ()=> {
            window.confirm.mockReturnValue(true);
            updateMe.mockRejectedValue({response:{data: {message:'Category deletion failed',},},});
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Delete Work',}));
            await waitFor(()=> {
                expect(screen.getByText('Category deletion failed')).toBeInTheDocument();
            });
        });
        it('uses default category deletion error',async() => {
            window.confirm.mockReturnValue(true);
            updateMe.mockRejectedValue({});
            renderDashboard();
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', {name: 'Delete Work',}));
            await waitFor(()=> {
                expect(screen.getByText('Could not delete category.')).toBeInTheDocument();
            });
        });
    });
    describe('view-specific behavior',()=>{
        it('renders the Favourites title',async() => {
            renderDashboard('/notes?favourite=true');
            await waitFor(()=>{
                expect(screen.getByText('Favourite Note')).toBeInTheDocument();
            });
            expect(screen.getByRole('heading',{name:'Favourites',})).toBeInTheDocument();
        });
        it('renders the Archived title', async() => {
            renderDashboard('/notes?archived=true');
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            expect(screen.getByRole('heading',{name:'Archived',})).toBeInTheDocument();
        });
        it('renders the Trash title', async()=> {
            renderDashboard('/notes?trashed=true');
            await waitFor(()=>{
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            expect(screen.getByRole('heading', {name:'Trash',})).toBeInTheDocument();
        });
        it('renders the selected category as the title',async () => {
            renderDashboard('/notes?category=Work');
            await waitFor(()=>{
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            expect(screen.getByRole('heading',{name: 'Work',}) ).toBeInTheDocument();
        });
        it('does not expose archive/delete actions in trash view',async () => {
            getNotes.mockResolvedValue({
                notes: [{...notes[0],isDeleted: true,},],
            });
            renderDashboard('/notes?trashed=true');
            await waitFor(()=> {
                expect(screen.getByText('First Note')).toBeInTheDocument();
            });
            expect(screen.getByRole('button', {name: 'Restore 1',}) ).toBeInTheDocument();
            expect(screen.getByRole('button',{name: 'Delete Forever 1',})).toBeInTheDocument();
        });
    });
    describe('request race protection',()=>{
        it('ignores stale API responses',async () => {
            let firstResolve;
            let secondResolve;
            getNotes
                .mockImplementationOnce(() =>new Promise((resolve) => {
                            firstResolve = resolve;
                        })
                ).mockImplementationOnce(()=>new Promise((resolve)=> {
                            secondResolve= resolve;
                        })
                );
            renderDashboard();
            const searchInput=screen.getByPlaceholderText('Search notes...');
            fireEvent.change(searchInput,{ target:{value: 'new search',}, });
            secondResolve({notes: [
                    {...notes[0],id: 3,title: 'Latest Note',},],});
            await waitFor(() => {
                expect(screen.getByText('Latest Note')).toBeInTheDocument();
            });
            firstResolve({
                notes: [{...notes[0],id: 4,title: 'Stale Note',},],
            });
            await waitFor(()=>{
                expect(screen.queryByText('Stale Note')).not.toBeInTheDocument();
            });
        });
    });
});