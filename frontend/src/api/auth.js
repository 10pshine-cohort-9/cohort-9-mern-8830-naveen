import client from './client';
export const signup =(payload)=>{
    client.post('/auth/signup', payload).then((r)=>r.data);
};
export const login =(payload)=>{
    client.post('/auth/login', payload).then((r)=>r.data);
};
export const getMe = ()=>{
    client.get('/auth/me').then((r)=>r.data);
};
export const updateMe =(payload)=>{
    client.patch('/auth/me',payload).then((r)=> r.data);
};
export const changePassword =(payload)=>{
    client.patch('/auth.change-password', payload).then((r)=>r.data);
};
export const deleteAccount =()=>{
    client.delete('/auth/me').then((r)=>r.data);
};