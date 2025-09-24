import axios from "axios";

const api = axios.create({
    baseURL: "http://192.168.105.204:5001/api", 
    timeout: 10000, 
});
export default api;