import mongoose from "mongoose";
import { Schema } from "mongoose";


const messageSchema = new Schema({
    senderId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    receiverId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref: "User"
    },
    text:{
        type:String,
    },
    image:{
        type:String,
    }
},{timestamps:true});

const Message = mongoose.model('Message', messageSchema);

export default Message;