import React from 'react';
import {render,screen,fireEvent,waitFor,} from '@testing-library/react';
import ResetPassword from '../pages/ResetPassword';
import { resetPassword } from '../api/auth';
jest.mock('../api/auth');
jest.mock('react-router-dom', () => ({
    __esModule: true,Link:({children, to, ...props})=>(<a href={to} {...props}>{children}</a>),useSearchParams: jest.fn(),
}));
const {useSearchParams} = require('react-router-dom');
describe('ResetPassword', ()=>{
    beforeEach(() =>{
        jest.clearAllMocks();
        useSearchParams.mockReturnValue([new URLSearchParams('token=test-token'),]);
        resetPassword.mockResolvedValue({});
    });
    it('renders the reset password page',() =>{
        render(<ResetPassword />);
        expect(screen.getByRole('heading',{name:'Set New Password',})).toBeInTheDocument();
        expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
        expect(screen.getByRole('button',{name:'Reset Password',})).toBeInTheDocument();
        expect(screen.getByRole('link',{name:'Back to Login',})).toHaveAttribute('href', '/login');
    });
    it('updates the password inputs', () => {
        render(<ResetPassword />);
        const newPassword =screen.getByLabelText('New Password');
        const confirmPassword =screen.getByLabelText('Confirm New Password');
        fireEvent.change(newPassword,{target:{value: 'Password123',},});
        fireEvent.change(confirmPassword, {target:{value: 'Password123',},});
        expect(newPassword).toHaveValue('Password123');
        expect(confirmPassword).toHaveValue('Password123');
    });
    it('shows an error when the reset token is missing', async () =>{
        useSearchParams.mockReturnValue([new URLSearchParams(),]);
        render(<ResetPassword />);
        fireEvent.change(screen.getByLabelText('New Password'),{target:{value:'Password123',},});
        fireEvent.change(screen.getByLabelText('Confirm New Password'),{target: { value: 'Password123',},});
        fireEvent.click(screen.getByRole('button',{name:'Reset Password',}));
        expect( await screen.findByRole('alert') ).toHaveTextContent('This password reset link is invalid or incomplete. Please request a new reset link.' );
        expect(resetPassword).not.toHaveBeenCalled();
    });
    it('shows an error when the password is shorter than 8 characters', async () => {
        render(<ResetPassword />);
        fireEvent.change( screen.getByLabelText('New Password'), {target:{value:'short',},});
        fireEvent.change(screen.getByLabelText('Confirm New Password'),{target: {value: 'short',},});
        fireEvent.click(screen.getByRole('button',{name:'Reset Password',}));
        expect(await screen.findByRole('alert')).toHaveTextContent('Password must be at least 8 characters long.');
        expect(resetPassword).not.toHaveBeenCalled();
    });
    it('shows an error when passwords do not match', async () => {
        render(<ResetPassword />);
        fireEvent.change(screen.getByLabelText('New Password'),{target: {value:'Password123',}});
        fireEvent.change(screen.getByLabelText('Confirm New Password'),{target: {value: 'Different123',},});
        fireEvent.click(screen.getByRole('button',{name:'Reset Password',}));
        expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.');
        expect(resetPassword).not.toHaveBeenCalled();
    });
    it('resets the password successfully', async () => {
        resetPassword.mockResolvedValue({message: 'Password reset successfully.',});
        render(<ResetPassword />);
        fireEvent.change(screen.getByLabelText('New Password'),{target:{value: 'Password123',},});
        fireEvent.change(screen.getByLabelText('Confirm New Password'),{target: {value: 'Password123',},} );
        fireEvent.click(screen.getByRole('button',{name:'Reset Password',}) );
        await waitFor(() =>{
            expect(resetPassword).toHaveBeenCalledWith({token: 'test-token',newPassword: 'Password123',});
        });
        expect(await screen.findByRole('status')).toHaveTextContent( 'Password reset successfully. You can now log in.');
        expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Confirm New Password')).not.toBeInTheDocument();
    });
    it('shows the API error message when resetPassword fails', async() => {
        resetPassword.mockRejectedValue({response:{data:{message: 'Reset link has expired.',},},});
        render(<ResetPassword />);
        fireEvent.change(screen.getByLabelText('New Password'), {target: {value: 'Password123',},});
        fireEvent.change(screen.getByLabelText('Confirm New Password'),{target:{value:'Password123',},});
        fireEvent.click(screen.getByRole('button',{name:'Reset Password',}));
        expect(await screen.findByRole('alert')).toHaveTextContent('Reset link has expired.');
    });
    it('shows the default error when the API provides no message', async () => {
        resetPassword.mockRejectedValue({});
        render(<ResetPassword />);
        fireEvent.change(screen.getByLabelText('New Password'),{target:{value: 'Password123',},});
        fireEvent.change(screen.getByLabelText('Confirm New Password'),{target:{value:'Password123',},});
        fireEvent.click(screen.getByRole('button', {name:'Reset Password', }) );
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not reset your password. The link may have expired.');
    });
    it('disables the button and shows Resetting while the request is pending', async () => {
        let resolveRequest;
        resetPassword.mockReturnValue(new Promise((resolve) =>{resolveRequest = resolve;}));
        render(<ResetPassword />);
        fireEvent.change(screen.getByLabelText('New Password'),{target:{value:'Password123',},});
        fireEvent.change(screen.getByLabelText('Confirm New Password'),{target: {value: 'Password123',},});
        fireEvent.click(screen.getByRole('button',{name:'Reset Password',}));
        expect(screen.getByRole('button',{name: 'Resetting...',})).toBeDisabled();
        resolveRequest({});
        await waitFor(() =>{
            expect(screen.getByRole('status')).toHaveTextContent('Password reset successfully. You can now log in.');
        });
    });
    it('clears the password fields after a successful reset', async () => {
        render(<ResetPassword />);
        const newPassword =screen.getByLabelText('New Password');
        const confirmPassword =screen.getByLabelText('Confirm New Password');
        fireEvent.change(newPassword,{target: {value: 'Password123',},});
        fireEvent.change(confirmPassword,{target:{value: 'Password123',},});
        fireEvent.click(screen.getByRole('button',{name: 'Reset Password',}));
        await screen.findByRole('status');
        expect(newPassword).not.toBeInTheDocument();
        expect(confirmPassword).not.toBeInTheDocument();
    });
});