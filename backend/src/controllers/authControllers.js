import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"

export const signUp = async(req, res)=>{
    const {fullName, email, password, profilePic} = req.body;
    try{
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required!"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password Length must be at least 6"});
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(400).json({message: "Email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            profilePic,
            password: hashedPassword
        })
        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName:newUser.fullName,
                email: newUser.email,
                password: newUser.password,
                profilePic: newUser.profilePic
            })
        }else{
            res.status(400).json({
                message: "Invalid User Data"
            })
        }

    }catch(error){
        console.log("Error in signUp Controller", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const signIn = async(req, res)=>{
    const { email, password } = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"Invalid Credentials"
            })
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({
                message:"Invalid Credentials"
            })
        }
        generateToken(user._id,res);

        res.status(200).json({
            _id: user._id,
            fullName:user.fullName,
            email: user.email,
            password: user.password,
            profilePic: user.profilePic
        })
    }catch(error){
        console.log("Error in login Controller", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const logOut = (req, res)=>{
    try{
        res.cookie("jwt", "", {
            maxAge:0
        });
        res.status(200).json({
            message: "Logged out successfully"
        });
    }catch(error){
        console.log("Error in logout Controller", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth Controller", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}