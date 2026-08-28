import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
if(process.env.NODE_ENV === 'production' && !apiUrl.startsWith('https://')){
    throw new Error("REACT_APP_API_URL must use HTTPS in production.");
}
const client = axios.create({baseURL: apiUrl,withCredentials:true});

client.interceptors.response.use((response)=> response,(error)=>{
    if(error.response?.status===401){
        window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
});
export default client;