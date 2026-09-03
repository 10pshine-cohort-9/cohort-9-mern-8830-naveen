import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import Sidebar from '../components/Sidebar';
const mockNavigate = jest.fn();
const mockLogout = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock('react-router-dom',()=>({
    NavLink: ({ children, to, className }) =>{
        const classes =typeof className === 'function'? className({ isActive: false }): className;
        return (
            <a href={to}className={classes} onClick={(event)=>{event.preventDefault();mockNavigate(to);}} >{children}</a>
        );
    },
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
}));
jest.mock('../context/AuthContext',()=>({
    useAuth:()=>({
        user:{fullName:'Test User',},logout: mockLogout,
    }),
}));
const renderSidebar=({
    categories = [],
    onNewCategory = jest.fn(),
    onDeleteCategory = jest.fn(),
    search = '',
}={})=>{
    mockSearchParams = new URLSearchParams(search);
    return render(
        <Sidebar categories={categories} onNewCategory={onNewCategory} onDeleteCategory={onDeleteCategory}/>
    );
};
describe('Sidebar', ()=> {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams = new URLSearchParams();
    });
    test('renders sidebar navigation items', () =>{
        renderSidebar();
        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByText('All Notes')).toBeInTheDocument();
        expect(screen.getByText('Favourites')).toBeInTheDocument();
        expect(screen.getByText('Archived')).toBeInTheDocument();
        expect(screen.getByText('Trash')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('New Category')).toBeInTheDocument();
    });
    test('renders provided categories',()=> {
        renderSidebar({
            categories: ['Personal', 'Work', 'Ideas', 'Study'],
        });
        expect(screen.getByText('Personal')).toBeInTheDocument();
        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Ideas')).toBeInTheDocument();
        expect(screen.getByText('Study')).toBeInTheDocument();
    });
    test('navigates to all notes', () =>{
        renderSidebar();
        fireEvent.click(screen.getByText('All Notes'));
        expect(mockNavigate).toHaveBeenCalledWith('/notes');
    });
    test('navigates to favourites', ()=>{
        renderSidebar();
        fireEvent.click(screen.getByText('Favourites'));
        expect(mockNavigate).toHaveBeenCalledWith('/notes?favourite=true');
    });
    test('navigates to archived notes',() =>{
        renderSidebar();
        fireEvent.click(screen.getByText('Archived'));
        expect(mockNavigate).toHaveBeenCalledWith('/notes?archived=true');
    });
    test('navigates to trash', () =>{
        renderSidebar();
        fireEvent.click(screen.getByText('Trash'));
        expect(mockNavigate).toHaveBeenCalledWith('/notes?trashed=true');
    });
    test('navigates to a category',() =>{
        renderSidebar({categories: ['Personal'],});
        fireEvent.click(screen.getByText('Personal'));
        expect(mockNavigate).toHaveBeenCalledWith('/notes?category=Personal');
    });
    test('calls onNewCategory when New Category is clicked',()=>{
        const onNewCategory = jest.fn();
        renderSidebar({onNewCategory,});
        fireEvent.click(screen.getByText('New Category'));
        expect(onNewCategory).toHaveBeenCalledTimes(1);
    });
    test('calls onDeleteCategory with correct category',()=>{
        const onDeleteCategory = jest.fn();
        renderSidebar({categories: ['Personal', 'Work'],onDeleteCategory,});
        fireEvent.click(screen.getByRole('button',{name:'Delete Personal',}));
        expect(onDeleteCategory).toHaveBeenCalledTimes(1);
        expect(onDeleteCategory).toHaveBeenCalledWith('Personal');
    });
    test('opens user menu',()=>{
        renderSidebar();
        fireEvent.click(screen.getByRole('button',{name:/Test User/i,}));
        expect(screen.getByText('View Profile')).toBeInTheDocument();
        expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
    test('navigates to profile',()=>{
        renderSidebar();
        fireEvent.click(screen.getByRole('button',{name:/Test User/i, }) );
        fireEvent.click(screen.getByText('View Profile'));
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
    test('logs out and navigates to login',()=>{
        renderSidebar();
        fireEvent.click(screen.getByRole('button',{name:/Test User/i,}));
        fireEvent.click(screen.getByText('Log Out'));
        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    test('marks current category as active',()=>{
        renderSidebar({categories: ['Personal', 'Work'],search: 'category=Personal',});
        const personalButton = screen.getByRole('button', {name:'Personal',});
        expect(personalButton.className).toContain('bg-sand');
    });
    test('marks favourites as active',()=>{
        renderSidebar({search: 'favourite=true',});
        const favouritesLink = screen
            .getByText('Favourites')
            .closest('a');
        expect(favouritesLink.className).toContain('bg-sand');
    });
    test('marks archived as active',()=>{
        renderSidebar({search: 'archived=true',});
        const archivedLink = screen
            .getByText('Archived')
            .closest('a');
        expect(archivedLink.className).toContain('bg-sand');
    });
    test('marks trash as active',()=>{
        renderSidebar({search: 'trashed=true',});
        const trashLink = screen
            .getByText('Trash')
            .closest('a');
        expect(trashLink.className).toContain('bg-sand');
    });
});