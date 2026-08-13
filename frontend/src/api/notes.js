import client from './client';
export const getNotes = (params)=>{
    client.get('/notes', {params}).then((r)=>r.data);
}
export const getNote =(id)=>{
    client.get(`/notes/${id}`).then((r)=>r.data);
};
export const createNote =(payload)=>{
    client.post('/notes', payload).then((r)=>r.data);
};
export const updateNote=(id,payload)=>{
    client.patch(`/notes/${id}`,payload).then((r)=>r.data);
};
export const deleteNote =(id)=>{
    client.delete(`/notes/${id}`).then((r)=>r.data);
};