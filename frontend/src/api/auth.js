import client from './client';
export const signup =async(payload)=>{
    const response = await client.post('/auth/signup', payload);
    return response.data;
};
export const login =async(payload)=>{
    const response = await client.post('/auth/login', payload);
    return response.data;
};
export const getMe = async()=>{
    const response = await client.get('/auth/me');
    return response.data;
};
export const updateMe =async(payload)=>{
    const response=await client.patch('/auth/me',payload);
    return response.data;
};
export const changePassword =async(payload)=>{
    const response = await client.patch('/auth/change-password', payload);
    return response.data;
};
export const deleteAccount =async()=>{
    const response = await client.delete('/auth/me');
    return response.data;
};
export const forgotPassword =async(payload)=>{
    const response = await client.post('/auth/forgot-password',payload);
    return response.data;
};
export const resetPassword =async(payload)=>{
    const response = await client.post('/auth/reset-password', payload);
    return response.data;
};