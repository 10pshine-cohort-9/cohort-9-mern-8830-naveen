import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import * as authApi from '../api/auth';
const AuthContext = createContext(null);

export const AuthProvider =({children})=>{
    const [user,setUser] =useState(null);
    const [loading, setLoading] =useState(true);
    const [authError, setAuthError] = useState(null);
    const logout =useCallback(async()=>{
        try{
            await authApi.logout();
        }
        catch(err){
        }
        finally{
            setUser(null);
        }
    },[]);
    const loadUser = useCallback(async()=>{
        setAuthError(null);
        try{
            const {user:me} = await authApi.getMe();
            setUser(me);
            setLoading(false);
        }
        catch(err){
            const status = err.response?.status;
            if(status === 401 || status === 403){
                setUser(null);
            }
            else{
                setAuthError(err);
            }
        }
        finally{
            setLoading(false);
        }
    },[]);
    useEffect(()=>{
        const handleUnauthorized = async()=>{
            await logout()
            setLoading(false);
        };
        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return()=>{
            window.removeEventListener("auth:unauthorized", handleUnauthorized);
        }
    }, [logout]);
    useEffect(()=>{
        loadUser();
    },[loadUser]);
    const signup = async(payload)=>{
        const data = await authApi.signup(payload);
        setUser(data.user);
        return data;
    };
    const login = async(payload)=>{
        const data = await authApi.login(payload);
        setUser(data.user);
        return data;
    };
    const refreshUser=async()=>{
        try{
            const {user: me} = await authApi.getMe();
            setUser(me);
            return me;
        }
        catch(err){
            const status = err.response?.status;
            if(status === 401 || status === 403){
                logout();
            }
            throw err;
        }
    };
    return(
        <AuthContext.Provider value={{user,loading,authError,signup,login,logout,refreshUser,setUser}}>{children}</AuthContext.Provider>
    );
};
export const useAuth =()=>{
    const ctx=useContext(AuthContext);
    if(!ctx){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
};