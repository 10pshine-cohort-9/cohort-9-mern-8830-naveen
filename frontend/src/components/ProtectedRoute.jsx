import React from "react";
import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
const ProtectedRoute=({children})=>{
    const {user,loading,authError}=useAuth();
    if(loading){
        return(
            <div className="flex h-screen items-center justify-center bg-cream text-ink/60 text-sm">
                Loading...
            </div>
        );
    }
    if(authError){
        return(
            <div className="flex h-screen items-center justify-center bg-cream text-ink/60 text-sm">Unable to verify your session. Please try again.</div>
        );
    }
    if(!user){
        return <Navigate to='/login' replace/>;
    }
    return children;

};
export default ProtectedRoute;