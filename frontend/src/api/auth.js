import client from './client';
export const signup =async(payload)=>{
    try{
        const response = await client.post('/auth/signup', payload);
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message || 'Signup failed.', status: err.response?.status, response: err.response,
        };
    }
};
export const login =async(payload)=>{
    try{
        const response = await client.post('/auth/login', payload);
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message || 'Login failed.', status: err.response?.status, response: err.response,        
        }
    }
};
export const getMe = async()=>{
    try{
        const response = await client.get('/auth/me');
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message || 'Could not load user.', status: err.response?.status, response: err.response,
        }
    }
};
export const updateMe =async(payload)=>{
    try{
    const response=await client.patch('/auth/me',payload);
    return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message || 'Could not update profile.', status: err.response?.status, response: err.response,

        }
    }
};
export const changePassword =async(payload)=>{
    try{
        const response = await client.patch('/auth/change-password', payload);
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message || 'Could not change password.', status: err.response?.status, response: err.response,

        }
    }
};
export const deleteAccount =async()=>{
    try{
        const response = await client.delete('/auth/me');
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message || 'Could not delete account.', status: err.response?.status, response: err.response,
        }
    }
};
export const forgotPassword =async(payload)=>{
    try{
        const response = await client.post('/auth/forgot-password',payload);
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message || 'Could not send reset instructions.', status: err.response?.status, response: err.response,
        }
    }
};
export const resetPassword =async(payload)=>{
    try{
        const response = await client.post('/auth/reset-password', payload);
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message || 'Could not reset password.', status: err.response?.status, response: err.response,
        }
    }
};