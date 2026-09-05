import React from 'react';
import {render,screen} from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
const mockNavigate = jest.fn();
const mockUseAuth = jest.fn();
jest.mock('react-router-dom',()=>({
    Navigate:({to})=>{mockNavigate(to);
        return <div>Login Page</div>;
    },
}));
jest.mock('../context/AuthContext',()=>({useAuth:()=>mockUseAuth(),}));
const renderProtectedRoute=(authState)=>{mockUseAuth.mockReturnValue(authState);
    return render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
};
describe('ProtectedRoute',()=>{
    beforeEach(()=>{
        jest.clearAllMocks();
    });
    test('shows loading state while authentication is loading',()=>{
        renderProtectedRoute({user: null,loading: true,authError: null,});
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
    test('shows authentication error when authError exists',() =>{
        renderProtectedRoute({user: null,loading: false,authError: 'Session verification failed',});
        expect(screen.getByText('Unable to verify your session. Please try again.')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
    test('redirects unauthenticated users to login',()=>{
        renderProtectedRoute({user: null,loading: false,authError: null,});
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
    test('renders protected content for authenticated users',()=>{
        renderProtectedRoute({user:{id: '1',fullName:'Test User',},loading: false,authError: null,});
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
    test('shows auth error before redirecting',()=>{
        renderProtectedRoute({user: null, loading: false,authError: 'Unable to verify',});
        expect(screen.getByText('Unable to verify your session. Please try again.')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
});