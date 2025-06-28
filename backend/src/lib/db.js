import mongoose from "mongoose";

export const connectDB = async function main() {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
    }catch(err){
        console.log(err);
    }
}