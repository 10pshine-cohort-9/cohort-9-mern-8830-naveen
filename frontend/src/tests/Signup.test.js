import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import Signup from '../pages/Signup';
const mockNavigate = jest.fn();
const mockSignup = jest.fn();
jest.mock('react-router-dom',()=>({
    __esModule: true,
    Link:({to,children, ...props})=>(<a href={to}{...props}>{children}</a>
    ),useNavigate: () => mockNavigate,
}));
jest.mock('../context/AuthContext',()=>({
    useAuth: ()=>({signup: mockSignup,}),
}));
describe('Signup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSignup.mockResolvedValue({user: {fullName: 'Test User',email: 'test@example.com',},
        });
    });
    it('renders the signup page', () => {
        render(<Signup />);
        expect(screen.getByRole('heading',{name: 'Create your account',})).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button',{name:/Sign up/i,})).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'Log in',})).toHaveAttribute('href', '/login');
    });
    it('updates all form fields',() => {
        render(<Signup />);
        const fullName = screen.getByPlaceholderText('Full Name');
        const email = screen.getByPlaceholderText('Email');
        const password = screen.getByPlaceholderText('Password');
        const confirmPassword =screen.getByPlaceholderText('Confirm Password');
        fireEvent.change(fullName, {target: {value: 'Test User',},});
        fireEvent.change(email, {target: {value: 'test@example.com',},});
        fireEvent.change(password, {target: {value: 'password123',},});
        fireEvent.change(confirmPassword, {target: {value: 'password123',},});
        expect(fullName).toHaveValue('Test User');
        expect(email).toHaveValue('test@example.com');
        expect(password).toHaveValue('password123');
        expect(confirmPassword).toHaveValue('password123');
    });
    it('shows an error when passwords do not match', async () => {
        render(<Signup />);
        fireEvent.change(screen.getByPlaceholderText('Password'),{target: {value: 'password123',},});
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'),{target: {value: 'different123', },} );
        fireEvent.click(screen.getByRole('button', {name: /Sign up/i,}));
        await waitFor(()=>{
            expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
        });
        expect(mockSignup).not.toHaveBeenCalled();
    });
    it('shows an error when password is shorter than 8 characters', async () => {
        render(<Signup />);
        fireEvent.change(screen.getByPlaceholderText('Password'),{target:{value: 'short',},});
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'),{target:{value:'short',},});
        fireEvent.click(screen.getByRole('button',{name:/Sign up/i,}));
        await waitFor(()=>{
            expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
        });
        expect(mockSignup).not.toHaveBeenCalled();
    });
    it('requires accepting the terms and privacy policy', async () => {
        render(<Signup />);
        fireEvent.change(screen.getByPlaceholderText('Full Name'),{target: {value: 'Test User',},} );
        fireEvent.change(screen.getByPlaceholderText('Email'),{target: {value: 'test@example.com',},});
        fireEvent.change(screen.getByPlaceholderText('Password'),{target: {value: 'password123',},});
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'),{target: {value: 'password123',},});
        fireEvent.click(screen.getByRole('button',{name: /Sign up/i,}));
        await waitFor(() => {
            expect(screen.getByText('Please accept the Terms of Service and Privacy Policy.')).toBeInTheDocument();
        });
        expect(mockSignup).not.toHaveBeenCalled();
    });
    it('successfully creates an account and navigates to notes', async () => {
        render(<Signup />);
        fireEvent.change(screen.getByPlaceholderText('Full Name'),{target: {value: 'Test User',},});
        fireEvent.change(screen.getByPlaceholderText('Email'),{target: {value: 'test@example.com',},});
        fireEvent.change(screen.getByPlaceholderText('Password'),{target: {value: 'password123',},});
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'),{target:{value: 'password123',},});
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', {name: /Sign up/i,}));
        await waitFor(() =>{
            expect(mockSignup).toHaveBeenCalledWith({fullName: 'Test User',email: 'test@example.com',password: 'password123',});
        });
        expect(mockNavigate).toHaveBeenCalledWith('/notes');
    });
    it('shows the API error message when signup fails', async () =>{
        mockSignup.mockRejectedValue({response: {data: {message: 'Email already exists.',},},});
        render(<Signup />);
        fireEvent.change(
            screen.getByPlaceholderText('Full Name'),{target: {value: 'Test User',},});

        fireEvent.change(screen.getByPlaceholderText('Email'),{target: {value: 'test@example.com',},});
        fireEvent.change(screen.getByPlaceholderText('Password'),{target: {value: 'password123',},});
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'),{target:{value: 'password123',},});
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', {name: /Sign up/i,}));
        await waitFor(()=>{
            expect(screen.getByText('Email already exists.')).toBeInTheDocument();
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });
    it('shows the default error when signup fails without a message', async () => {
        mockSignup.mockRejectedValue({});
        render(<Signup />);
        fireEvent.change(screen.getByPlaceholderText('Full Name'),{target:{value: 'Test User',},});
        fireEvent.change(screen.getByPlaceholderText('Email'),{target: {value: 'test@example.com',}, });
        fireEvent.change(screen.getByPlaceholderText('Password'),{target: {value: 'password123',},});
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'),{target: {value: 'password123',},});
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button',{name: /Sign up/i,}));
        await waitFor(() =>{
            expect(screen.getByText('Could not create account.')).toBeInTheDocument();
        });
    });
    it('disables the submit button while signup is pending', async () => {
        let resolveSignup;
        mockSignup.mockReturnValue(
            new Promise((resolve) => {
                resolveSignup = resolve;
            })
        );
        render(<Signup />);
        fireEvent.change(screen.getByPlaceholderText('Full Name'),{target: {value: 'Test User',},});
        fireEvent.change(screen.getByPlaceholderText('Email'),{target: {value: 'test@example.com',},});
        fireEvent.change(screen.getByPlaceholderText('Password'),{target: {value: 'password123',},});
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'),{target: {value: 'password123',},});
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button',{name: /Sign up/i,}));
        expect(screen.getByRole('button',{name: /Creating account/i,})).toBeDisabled();
        resolveSignup({});
        await waitFor(()=>{
            expect(screen.getByRole('button',{name: /Sign up/i,})).not.toBeDisabled();
        });
    });
});