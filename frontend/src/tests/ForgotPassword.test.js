import React from 'react';
import {render,screen,fireEvent,waitFor,} from '@testing-library/react';
import ForgotPassword from '../pages/ForgotPassword';
import {forgotPassword} from '../api/auth';
const mockNavigate= jest.fn();
jest.mock('../api/auth');
jest.mock('react-router-dom',()=>({
    __esModule: true,
    Link: ({ to,children, ...props })=>(
        <a href={to} {...props}>{children}</a>
    ),
    useNavigate:()=>mockNavigate,
}));
describe('ForgotPassword',()=>{
    beforeEach(()=>{
        jest.clearAllMocks();
        forgotPassword.mockResolvedValue({message: 'Reset link sent successfully.',});
    });
    it('renders the forgot password page',()=>{
        render(<ForgotPassword />);
        expect(screen.getByRole('heading',{name:'Reset Password',})).toBeInTheDocument();
        expect(screen.getByText("Enter your email address and we'll send you a link to reset your password.")).toBeInTheDocument();
        expect( screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Send Reset Link',})).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'Back to Login',})).toHaveAttribute('href', '/login');
    });
    it('updates the email input',()=>{
        render(<ForgotPassword />);
        const emailInput =screen.getByLabelText('Email Address');
        fireEvent.change(emailInput, {
            target: {
                value: 'test@example.com',
            },});
        expect(emailInput).toHaveValue('test@example.com');
    });
    it('submits the email successfully', async () => {
        render(<ForgotPassword />);
        const emailInput =screen.getByLabelText('Email Address');
        fireEvent.change(emailInput, {
            target:{value: 'test@example.com',},
        });
        fireEvent.click(screen.getByRole('button',{name: 'Send Reset Link',}));

        await waitFor(()=>{
            expect(forgotPassword).toHaveBeenCalledWith({email: 'test@example.com',});
        });
        expect(await screen.findByRole('status')).toHaveTextContent('Reset link sent successfully.');
    });
    it('uses the default success message when API does not return a message',async()=>{
        forgotPassword.mockResolvedValue({});
        render(<ForgotPassword />);
        fireEvent.change(screen.getByLabelText('Email Address'),{target:{value: 'test@example.com',},});
        fireEvent.click(screen.getByRole('button',{name: 'Send Reset Link',}) );
        expect(await screen.findByRole('status')).toHaveTextContent('If an account exists with that email, a password reset link has been sent.');
    });
    it('shows the API error message when the request fails',async()=>{
        forgotPassword.mockRejectedValue({response:{data:{message: 'Email address is invalid.',},},});
        render(<ForgotPassword />);
        fireEvent.change(screen.getByLabelText('Email Address'),{target:{value:'invalid@example.com',},} );
        fireEvent.click(screen.getByRole('button', {name: 'Send Reset Link', }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Email address is invalid.');
    });
    it('shows the default error when the API provides no message', async () => {
        forgotPassword.mockRejectedValue({});
        render(<ForgotPassword />);
        fireEvent.change(screen.getByLabelText('Email Address'),{target:{value: 'test@example.com',},} );
        fireEvent.click(screen.getByRole('button',{name: 'Send Reset Link',}));
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not process your password reset request.');
    });
    it('clears the previous error when submitting again',async()=>{
        forgotPassword
            .mockRejectedValueOnce({response:{data:{message: 'First request failed.',},},})
            .mockResolvedValueOnce({message: 'Second request succeeded.',});
        render(<ForgotPassword />);
        const emailInput =screen.getByLabelText('Email Address');
        const submitButton =screen.getByRole('button',{name:'Send Reset Link',});
        fireEvent.change(emailInput,{target:{value:'test@example.com',},});
        fireEvent.click(submitButton);
        expect(await screen.findByRole('alert')).toHaveTextContent('First request failed.');
        fireEvent.click(submitButton);
        expect(await screen.findByRole('status')).toHaveTextContent('Second request succeeded.');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    it('disables the submit button while the request is pending', async () => {
        let resolveRequest;
        forgotPassword.mockReturnValue(
            new Promise((resolve)=>{
                resolveRequest= resolve;
            })
        );
        render(<ForgotPassword />);
        fireEvent.change(screen.getByLabelText('Email Address'),{target:{value:'test@example.com',},});
        fireEvent.click(screen.getByRole('button',{name:'Send Reset Link',}));
        expect(screen.getByRole('button', {name: 'Sending...',})).toBeDisabled();
        resolveRequest({message:'Reset link sent.',});
        await waitFor(()=>{
            expect(screen.getByRole('button',{name: 'Send Reset Link',})).not.toBeDisabled();
        });
    });
});