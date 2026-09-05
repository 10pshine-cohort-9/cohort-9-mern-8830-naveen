import React from 'react';
import {render,screen,fireEvent, waitFor,} from '@testing-library/react';
import ChangePassword from '../pages/ChangePassword';
import {changePassword} from '../api/auth';
const mockNavigate=jest.fn();
jest.mock('../api/auth');
jest.mock('react-router-dom',()=>({
    __esModule: true,useNavigate:() => mockNavigate,
}));
jest.mock('../components/Sidebar',()=>()=>(
    <aside data-testid="sidebar">Sidebar</aside>
));
describe('ChangePassword',()=>{
    beforeEach(() => {
        jest.clearAllMocks();
        changePassword.mockResolvedValue({});
    });
    const fillForm =({current = 'oldPassword123',newPassword = 'newPassword123', confirm = 'newPassword123',}={})=>{
        fireEvent.change(screen.getByLabelText('Current Password'),{target:{value: current,},});
        fireEvent.change(screen.getByLabelText('New Password'),{target: {value: newPassword,},});
        fireEvent.change(screen.getByLabelText('Confirm Password'),{target: {value: confirm,},} );
    };
    it('renders the change password page', () => {
        render(<ChangePassword />);
        expect(screen.getByRole('heading',{name: 'Change Password',})).toBeInTheDocument();
        expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
        expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Change Password',})).toBeInTheDocument();
        expect(screen.getByRole('button',{name:'Cancel',})).toBeInTheDocument();
    });
    it('navigates back to profile',()=>{
        render(<ChangePassword />);
        fireEvent.click(screen.getByRole('button',{name: /Back to Profile/i,}));
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
    it('shows an error when passwords do not match', async () => {
        render(<ChangePassword />);
        fillForm({newPassword: 'newPassword123',confirm: 'different123',});
        fireEvent.click(screen.getByRole('button', {name: 'Change Password',}));
        await waitFor(()=> {
            expect(screen.getByRole('alert')).toHaveTextContent('New password and confirm password do not match');
        });
        expect(changePassword).not.toHaveBeenCalled();
    });
    it('shows an error when new password is too short', async ()=>{
        render(<ChangePassword />);
        fillForm({newPassword: 'short',confirm: 'short', });
        fireEvent.click(screen.getByRole('button',{name:'Change Password',}));
        await waitFor(()=> {
            expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 8 characters long' );
        });
        expect(changePassword).not.toHaveBeenCalled();
    });
    it('prevents using the current password as the new password',async()=> {
        render(<ChangePassword />);
        fillForm({current: 'password123',newPassword: 'password123',confirm: 'password123',});
        fireEvent.click(screen.getByRole('button', {name: 'Change Password',}));
        await waitFor(()=>{
            expect(screen.getByRole('alert')).toHaveTextContent('New password cannot be same as the current password');
        });
        expect(changePassword).not.toHaveBeenCalled();
    });
    it('successfully changes the password', async ()=>{
        render(<ChangePassword />);
        fillForm();
        fireEvent.click(screen.getByRole('button',{name:'Change Password', }));
        await waitFor(()=>{
            expect(changePassword).toHaveBeenCalledWith({currentPassword:'oldPassword123',newPassword: 'newPassword123', });
        });
        await waitFor(()=> {
        expect( screen.getByRole('status')).toHaveTextContent('Password changed successfully');
    });
        expect( screen.getByLabelText('Current Password')).toHaveValue('');
        expect(screen.getByLabelText('New Password') ).toHaveValue('');
        expect(screen.getByLabelText('Confirm Password')).toHaveValue('');
    });
    it('shows the API error message when changing password fails',async ()=>{
        changePassword.mockRejectedValue({response:{data:{message: 'Current password is incorrect.', }, },});
        render(<ChangePassword />);
        fillForm();
        fireEvent.click(screen.getByRole('button', {name:'Change Password',}));
        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Current password is incorrect.' );
        });
    });
    it('shows the default error when API provides no message',async()=>{
        changePassword.mockRejectedValue({});
        render(<ChangePassword />);
        fillForm();
        fireEvent.click(screen.getByRole('button', {name:'Change Password',}));
        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Could not change password');
        });
    });
    it('clears the form when Cancel is clicked',()=>{
        render(<ChangePassword />);
        fillForm();
        fireEvent.click(screen.getByRole('button', {name: 'Cancel',}));
        expect(screen.getByLabelText('Current Password')).toHaveValue('');
        expect(screen.getByLabelText('New Password') ).toHaveValue('');
        expect(screen.getByLabelText('Confirm Password')).toHaveValue('');
    });
    it('disables the submit button while request is pending',async()=>{
        let resolveRequest;
        changePassword.mockReturnValue(
            new Promise((resolve)=>{resolveRequest = resolve;})
        );
        render(<ChangePassword />);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: 'Change Password',}));
        expect(screen.getByRole('button', {name: 'Changing...',})).toBeDisabled();
        resolveRequest({});
        await waitFor(()=>{
            expect( screen.getByText('Password changed successfully')).toBeInTheDocument();
        });
    });
});