import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js"
import toast from "react-hot-toast"
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set,get)=>({
    messages:[],
    users:[],
    selectedUser: null,
    isUsersLoading:false,
    isMessagesLoading:false,

    getUsers: async()=>{
        set({isUsersLoading:true});
        try {
            const response = await axiosInstance.get("/messages/users");
            set({users: response.data});
        } catch (error) {
            console.log("Error in getUsers", error);
            toast.error(error.response.data.message);
        }finally{
            set({isUsersLoading: false});
        }
    },
    getMessages: async(userId)=>{
        if (!userId) {
            toast.error("No user selected to fetch messages.");
            return;
        }
        set({isMessagesLoading:true});
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);  
            set({messages: response.data});
        } catch (error) {
            console.log("Error in getMessages", error);
            toast.error(error.response.data.message);
        }finally{
            set({isMessagesLoading: false});
        }
    },
    sendMessage: async(messageData) =>{
        const {selectedUser, messages} = get();
        if (!selectedUser) {
            toast.error("No user selected.");
            return;
        }
        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages: [...messages, response.data]});
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    subscribeToMessages: ()=>{
        const {selectedUser} = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage)=>{
            if(newMessage.senderId!==selectedUser._id)return;
            set({
                messages : [...get().messages,newMessage],
            })
        })
    },
    unsubscribeFromMessages: async()=>{
        const socket = useAuthStore.getState().socket;

        socket.off("newMessage");
    },
    setSelectedUser: (selectedUser) => {
        set({selectedUser})
    },
}))