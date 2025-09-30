import axios from "axios";

const api = axios.create({
    baseURL: "http://10.0.2.2:5001/api",
    
    //baseURL: "http://192.168.105.204:5001/api", 
    //baseURL: "http://192.168.1.37:5001/api",
    //baseURL: "http://localhost:5001/api", 
    timeout: 10000, 
});
export default api;