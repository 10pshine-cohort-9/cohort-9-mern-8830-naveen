import React from "react";
import {render,screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider, useAuth } from "../context/AuthContext";
import client from '../api/client';
jest.mock('../api/client');
jest.mock('react-router-dom', () => ({
    __esModule: true,
    useNavigate: () => jest.fn(),
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
    MemoryRouter: ({ children }) => <>{children}</>,
}));
const AuthState =()=>{
    const {loading} =useAuth();
    return(
        <div data-testid='auth-loading'>{String(loading)}</div>
    );
};
const renderLogin =()=>
    render(
        <MemoryRouter>
            <AuthProvider><AuthState/> <Login/></AuthProvider>
        </MemoryRouter>
    );
describe('Login page', ()=>{
    beforeEach(()=>{
        localStorage.clear();
        client.get.mockRejectedValue({response: {status:401}});
        client.post.mockReset();

    });

    it('renders the login form', async()=>{
        renderLogin();
        await waitFor(()=>{
            expect(screen.getByTestId('auth-loading')).toHaveTextContent("false");
        });
        expect(screen.getByText('Welcome back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });
    it('shows an error message on failed login', async()=>{
        client.post.mockRejectedValue({response:{data:{message:"Invalid email or password."}}});
        renderLogin();
        await waitFor(()=>{
            expect(screen.getByTestId("auth-loading")).toHaveTextContent("false");
        });
        fireEvent.change(screen.getByPlaceholderText('Email address'), {
            target:{value:'wrong@example.com'},
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target:{value:'wrongpass'},
        });
        fireEvent.click(screen.getByRole('button',{name:/login/i}));
        await waitFor(()=>{
            expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
        });
    });
    it('links to the signup page',async()=>{
        renderLogin();
        await waitFor(()=>{
            expect(screen.getByTestId("auth-loading")).toHaveTextContent("false");
        });
        expect(screen.getByText("Sign up")).toBeInTheDocument();
    });
});