import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import * as authApi from '../api/auth';
const AuthContext = createContext(null);

export const AuthProvider =({children})=>{
    const [user,setUser] =useState(null);
    const [loading, setLoading] =useState(true);
    const loadUser = useCallback(async()=>{
        const token = localStorage.getItem("notes_token");
        if(!token){
            setLoading(false);
            return;
        }
        try{
            const {user:me} = await authApi.getMe();
            setUser(me);
        }
        catch(err){
            localStorage.removeItem("notes_token");
        }
        finally{
            setLoading(false);
        }
    },[]);
    useEffect(()=>{
        loadUser();
    },[loadUser]);
    const signup = async(payload)=>{
        const data = await authApi.signup(payload);
        localStorage.setItem("notes_token", data.token);
        setUser(data.user);
        return data;
    };
    const login = async(payload)=>{
        const data = await authApi.login(payload);
        localStorage.setItem("notes_token", data.token);
        setUser(data.user);
        return data;
    };
    const logout =()=>{
        localStorage.removeItem("notes_token");
        setUser(null);
    };
    const refreshUser=async()=>{
        const {user:me} = await authApi.getMe();
        setUser(me);
        return me;
    };
    return(
        <AuthContext.Provider value={{user,loading,signup,login,logout,refreshUser,setUser}}>{children}</AuthContext.Provider>
    );
};
export const useAuth =()=>{
    const ctx=useContext(AuthContext);
    if(!ctx){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
};