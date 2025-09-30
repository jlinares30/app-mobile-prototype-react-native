import axios from "axios";

const api = axios.create({
    //for real device
    //baseURL: "http://192.168.105.204:5001/api",

    //for android emulator
    baseURL: "http://10.0.2.2:5001/api", 
    timeout: 10000, 
});
export default api;