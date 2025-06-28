import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protectRoute = async(req, res, next)=>{
    try{
        // find token , then validate(gives userId), then req.user = user (from json token);
        const token = req.cookies.jwt;
        if(!token){
            return res.status(400).json({
                message: "Unauthorized - No token provided"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // return {userId, ...}

        if(!decoded){
            return res.status(400).json({
                message: "Unauthorized - Invalid Token"
            })
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }
        req.user = user;
        next();
    }catch(error){
        console.log("Error in protectRoute MiddleWare");
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}