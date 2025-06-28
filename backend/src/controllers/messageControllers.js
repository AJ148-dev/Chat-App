import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js"
import {getReceiverSocketId, io} from "../lib/socket.js"

export const getUsersForSidebar = async(req, res)=>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar", error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getMessages = async(req, res)=>{
    try {
        const {id: receiverId} = req.params;
        const senderId = req.user._id;
        const allMessages = await Message.find({
            $or:[
                {senderId: senderId, receiverId: receiverId},
                {senderId: receiverId, receiverId: senderId}
            ]
        })
        res.status(200).json(allMessages);
    } catch (error) {
        console.log("Error in getMessages controller", error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const sendMessage = async (req,res)=>{
    try{
        const { text, image } = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image : imageUrl
        });
        await newMessage.save();
        res.status(201).json(newMessage);
        // todo : use socket.io

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

    }catch{
        console.log("Error in sendMessage controller", error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}