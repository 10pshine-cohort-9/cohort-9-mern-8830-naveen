import client from './client';
export const getNotes = async(params)=>{
    const response = await client.get('/notes', {params});
    return response.data;
};
export const getNote =async(id)=>{
    const response= await client.get(`/notes/${id}`);
    return response.data;
};
export const createNote =async(payload)=>{
    const response = await client.post('/notes', payload);
    return response.data;
};
export const updateNote=async(id,payload)=>{
    const response=await client.patch(`/notes/${id}`,payload);
    return response.data;
};
export const deleteNote =async(id)=>{
    const response = await client.delete(`/notes/${id}`);
    return response.data;
};