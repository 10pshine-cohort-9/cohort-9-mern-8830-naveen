import React from 'react';
import {render,screen,fireEvent,waitFor,} from '@testing-library/react';
import Profile from '../pages/Profile';
import {updateMe,deleteAccount} from '../api/auth';
const mockNavigate = jest.fn();
const mockLogout = jest.fn();
const mockSetUser = jest.fn();
const mockUser ={fullName: 'John Doe',email: 'john@example.com', tagline: 'Notes enthusiast',createdAt: '2025-01-15T00:00:00.000Z',timezone: 'Asia/Karachi',accountType: 'Free',theme: 'Light',language: 'English',};
jest.mock('../api/auth');
jest.mock('react-router-dom',()=> ({
    __esModule: true, useNavigate: () => mockNavigate,
}));
jest.mock('../components/Sidebar', () => () => (
    <aside data-testid="sidebar">Sidebar</aside>
));
jest.mock('../context/AuthContext',()=>({
    useAuth:()=>({user: mockUser,logout: mockLogout,setUser: mockSetUser,}),
}));
describe('Profile', ()=>{
    beforeEach(() =>{
        jest.clearAllMocks();
        updateMe.mockResolvedValue({
            user: {...mockUser,fullName: 'Updated User',tagline: 'Updated tagline',},
        });
        deleteAccount.mockResolvedValue({});
    });
    it('renders profile information', ()=>{
        render(<Profile />);
        expect(screen.getByRole('heading',{name:'My Profile',})).toBeInTheDocument();
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
        expect(screen.getAllByText('john@example.com')[0]).toBeInTheDocument();
        expect(screen.getByText('Notes enthusiast')).toBeInTheDocument();
        expect(screen.getByText('Asia/Karachi')).toBeInTheDocument();
        expect(screen.getByText('Free')).toBeInTheDocument();
        expect(screen.getByRole('button',{name:/Edit Profile/i,})).toBeInTheDocument();
    });
    it('renders account and preference sections', () => {
        render(<Profile />);
        expect(screen.getByText('Account Information')).toBeInTheDocument();
        expect(screen.getByText('Preferences')).toBeInTheDocument();
        expect(screen.getByText('Security')).toBeInTheDocument();
        expect(screen.getByText('Manage Account')).toBeInTheDocument();
        expect(screen.getByText('Change Password')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });
    it('enters edit mode',()=>{
        render(<Profile />);
        fireEvent.click(screen.getByRole('button', {name: /Edit Profile/i,}));
        expect(screen.getByLabelText('Full Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Tagline')).toHaveValue('Notes enthusiast');
        expect(screen.getByRole('button',{name:'Save',})).toBeInTheDocument();
    });
    it('updates full name and tagline', async () => {
        render(<Profile />);
        fireEvent.click(screen.getByRole('button',{name:/Edit Profile/i,}));
        fireEvent.change(screen.getByLabelText('Full Name'),{target: {value: 'Updated User',},});
        fireEvent.change(screen.getByLabelText('Tagline'),{target: {value: 'Updated tagline',},});
        fireEvent.click(screen.getByRole('button',{name:'Save',}));
        await waitFor(() =>{
            expect(updateMe).toHaveBeenCalledWith({fullName: 'Updated User',tagline: 'Updated tagline',});
        });
        expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({fullName: 'Updated User',tagline: 'Updated tagline',}));
    });
    it('shows validation error when full name is empty', async () => {
        render(<Profile />);
        fireEvent.click(screen.getByRole('button',{name:/Edit Profile/i,}));
        fireEvent.change(screen.getByLabelText('Full Name'),{target: { value: '   ',},});
        fireEvent.click(screen.getByRole('button', {name: 'Save',}));
        await waitFor(() =>{
            expect(screen.getByRole('alert')).toHaveTextContent('Full name is required.');
        });
        expect(updateMe).not.toHaveBeenCalled();
    });
    it('shows API error when profile update fails', async()=>{
        updateMe.mockRejectedValue({response:{data:{message:'Profile update failed.',},},});
        render(<Profile />);
        fireEvent.click(screen.getByRole('button',{name:/Edit Profile/i, }));
        fireEvent.change(screen.getByLabelText('Full Name'),{target:{value:'Updated User',},});
        fireEvent.click(screen.getByRole('button',{name:'Save',}));
        await waitFor(() =>{
            expect(screen.getByRole('alert')).toHaveTextContent('Profile update failed.');
        });
    });
    it('shows default error when profile update fails without message', async () => {
        updateMe.mockRejectedValue({});
        render(<Profile/>);
        fireEvent.click(screen.getByRole('button', {name: /Edit Profile/i,}));
        fireEvent.change(screen.getByLabelText('Full Name'),{target:{value:'Updated User',},});
        fireEvent.click(screen.getByRole('button',{name:'Save',}));
        await waitFor(()=>{
            expect(screen.getByRole('alert')).toHaveTextContent('Could not update your profile.');
        });
    });
    it('cancels profile editing and restores original values', () => {
        render(<Profile/>);
        fireEvent.click(screen.getByRole('button',{name:/Edit Profile/i,}));
        fireEvent.change(screen.getByLabelText('Full Name'),{target:{value: 'Changed Name',},});
        fireEvent.click(screen.getByRole('button',{name:'Cancel',}));
        expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument();
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    });
    it('logs out the user and navigates to login', () =>{
        render(<Profile/>);
        fireEvent.click(screen.getByRole('button',{name:/Logout/i,}));
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    it('opens the delete account confirmation',()=>{
        render(<Profile/>);
        fireEvent.click(screen.getByRole('button',{name:/Delete Account/i,}));
        expect(screen.getByText('Are you sure you want to delete your account?')).toBeInTheDocument();
        expect(screen.getByRole('button',{name:'Delete',})).toBeInTheDocument();
    });
    it('deletes the account successfully', async () => {
        render(<Profile />);
        fireEvent.click(screen.getByRole('button',{name:/Delete Account/i,}));
        fireEvent.click(screen.getByRole('button',{name:'Delete',}));
        await waitFor(()=>{
            expect(deleteAccount).toHaveBeenCalled();
        });
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('shows API error when account deletion fails', async () => {
        deleteAccount.mockRejectedValue({response:{data:{message:'Unable to delete account.',},},});
        render(<Profile/>);
        fireEvent.click(screen.getByRole('button',{name:/Delete Account/i,}));
        fireEvent.click(screen.getByRole('button',{name:'Delete',}));
        await waitFor(() =>{
            expect(screen.getByRole('alert')).toHaveTextContent('Unable to delete account.');
        });
        expect(mockLogout).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
    it('cancels account deletion',()=>{
        render(<Profile />);
        fireEvent.click(screen.getByRole('button', {name: /Delete Account/i,}));
        fireEvent.click(screen.getByRole('button',{name:'Cancel',}));
        expect(screen.queryByText('Are you sure you want to delete your account?')).not.toBeInTheDocument();
    });
    it('navigates to change password', () => {
        render(<Profile />);
        fireEvent.click(screen.getByRole('button',{name:/Change Password/i,}));
        expect(mockNavigate).toHaveBeenCalledWith('/change-password');
    });
});