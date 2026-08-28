import client from './client';
export const getNotes = async(params)=>{
    try{
        const response = await client.get('/notes', {params});
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message || 'Could not load notes.', status: err.response?.status, response: err.response,
        };
    }
};
export const getNote =async(id)=>{
    try{
        const response= await client.get(`/notes/${id}`);
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message||'Could not load note.', status: err.response?.status, response: err.response,
        };
    }
};
export const createNote =async(payload)=>{
    
    try{
        const response = await client.post('/notes', payload);
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message||'Could not create note.', status: err.response?.status, response: err.response,
        };
    }
};
export const updateNote=async(id,payload)=>{
    try{
        const response=await client.patch(`/notes/${id}`,payload);
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message||'Could not update note.', status: err.response?.status, response: err.response,
        };
    }
};
export const deleteNote =async(id)=>{
    try{
        const response = await client.delete(`/notes/${id}`);
        return response.data;
    }
    catch(err){
        throw{
            message: err.response?.data?.message||'Could not delete note.', status: err.response?.status, response: err.response,
        };
    }
};