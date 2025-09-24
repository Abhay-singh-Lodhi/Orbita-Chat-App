import User from '../models/user.model.js';
import {generateToken} from '../lib/utils.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';
export const signup = async (req,res)=>{
   const {fullName,email,password,profilePic}  = req.body;
   try {
    if(!fullName || !email || !password){
       return res.status(400).json({message : "Fill all Required fields"});
    }
    if(password.length<6){
        return res.status(400).json({message : "password must me at least 6 characters"});
    }
    const user = await User.findOne({email});
    if(user) return res.status(400).json({message : "User Already Exists"});

    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new User({
        fullName,
        email,
        password:hashedPassword,
        profilePic
    })

    if(newUser){
        //generate token 
        generateToken(newUser._id,res);
        await newUser.save();

        res.status(201).json({
            _id : newUser._id,
            fullName : newUser.fullName,
            email:newUser.email,
            profilePic : newUser.profilePic
        });
    }else{
       return  res.status(400).json({message:"Invalid user data"});
    }

   } catch (error) {
    console.log(`Error in signup controller ${error}`);
    return res.status(400).json({message:"Internal Server Error"});
   }
}


export const login = async (req,res)=>{
   const {email,password} = req.body;
   try {
    if(!email || !password){
        return res.status(400).json({message : "Provide email and password"});
    }
    const user = await User.findOne({email});
    if(!user){
       return res.status(400).json({message : "Invalid Credentials"});
    }
   const isPasswordCorrect = await bcrypt.compare(password,user.password);
   if(!isPasswordCorrect){
   return res.status(400).json({message : "Invalid Credentials"});
   }

   generateToken(user._id,res);

    res.status(201).json({
            _id : user._id,
            fullName : user.fullName,
            email:user.email,
            profilePic : user.profilePic
        });
   } catch (error) {
       console.log(`Error in login Controller: ${error}`);
         return  res.status(500).json({message : "Internal Server Error"});
   }
}


export const logout = (req,res)=>{
   try {
    res.cookie("jwt","",{maxAge:0});
    return res.status(200).json({message:"Logged out Successfully"});
    
   } catch (error) {
    console.log(`Error in logout controller: ${error.message}`);
      return  res.status(500).json({message : "Internal Server Error"});
   } 
}

export const updateProfile = async(req,res)=>{
   try {
    const {profilePic} = req.body;
     const userId = req.user._id;

     if(!profilePic){
       return res.status(400).json({message:"Profile pic required"});
     }
  const uploadResponse= await cloudinary.uploader.upload(profilePic);
  const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
 return res.status(200).json(updatedUser);
   } catch (error) {
    console.log(`error in updating profile ${error}`);
    return res.status(500).json({message:"Internal Server Error"});
   }
}

export const checkAuth = (req,res)=>{
     try {
        res.status(200).json(req.user);
     } catch (error) {
        console.log(`error in checkAuth controller : ${error.message}`);
        return res.status(500).json({message:"Internal Server Error"});
     }
}