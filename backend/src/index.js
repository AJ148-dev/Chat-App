import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors"; //when backend and frontend are not on the same 
import { app, server } from "./lib/socket.js";
import path from "path"

dotenv.config();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // to access cookies
}))  // it should be before any routes 

app.use(express.json({limit: "3mb"}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*", (req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    })
}



server.listen(PORT,()=>{
    console.log("Server is listening on Port:" + PORT);
    connectDB();
})