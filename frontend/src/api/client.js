import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
if(process.env.NODE_ENV === 'production' && !apiUrl.startsWith('https://')){
    throw new Error("REACT_APP_API_URL must use HTTPS in production.");
}
const client = axios.create({baseURL: apiUrl});
client.interceptors.request.use((config)=>{
    const token = localStorage.getItem("notes_token");
    if(token){
        config.headers.Authorization =`Bearer ${token}`;
    }
    return config;
});
client.interceptors.response.use((response)=> response,(error)=>{
    if(error.response?.status===401){
        localStorage.removeItem("notes_token");
        window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
});
export default client;