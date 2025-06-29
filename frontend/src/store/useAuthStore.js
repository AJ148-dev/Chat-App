import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js"
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const BASE_URL = import.meta.env.MODE==="development"?"http://localhost:5001":"/";

export const useAuthStore = create((set,get)=>({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket:null,

    checkAuth: async()=>{
        try{
            const response = await axiosInstance.get("/auth/check");
            set({authUser: response.data});
            get().connectSocket();
        }catch(error){
            console.log("Error in CheckAuth function", error);
            set({authUser: null});
        }finally{
            set({isCheckingAuth: false});
        }
    },

    signup : async(formData)=>{
        set({isSigningUp:true});
        try{
            const res = await axiosInstance.post("/auth/signup",formData)
            set({authUser: res.data});
            toast.success("Account Created Successfully");
            get().connectSocket();
        }catch(error){
            toast.error(error.response.data.message)
            console.log("Error in signup function", error);
            set({authUser: null});

        }finally{
             set({isSigningUp:false});
        }
    },

    login : async(formData)=>{
        set({isLoggingIn:true});
        try{
            const res = await axiosInstance.post("/auth/signin",formData);
            set({authUser:res.data});
            toast.success("Logged in successfully");
            get().connectSocket();
        }catch(error){
            toast.error(error.response.data.message)
            console.log("Error in login function", error);
            set({authUser: null});
        }finally{
            set({isLoggingIn: false});  
        }
    },

    logout : async()=>{
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            toast.success("Logged out successfully");
            get().disconnectSocket();
        }catch(error){ 
            toast.error(error.response.data.message)
            console.log("Error in logout", error);
            
        }
    },
    
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/updateprofile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: ()=>{
        const {authUser} = get();
        if(!authUser || get().socket?.connected)return;

        const socket = io(BASE_URL,{
            query: {
                userId: authUser._id,
            },
        })
        socket.connect()

        set({socket:socket});

        socket.on("getOnlineUsers", (userIds)=>{
            set({onlineUsers:userIds});
        });
    },
    disconnectSocket: ()=>{
        if(get().socket?.connected) get().socket.disconnect();
    }
}))