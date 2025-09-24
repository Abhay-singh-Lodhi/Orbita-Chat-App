import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";

export const protectRoute = async(req,res,next)=>{
    try {
        console.log("Cookies:", req.cookies);
console.log("JWT token:", req.cookies.jwt, typeof req.cookies.jwt);

        const token = req.cookies.jwt;
    if(!token){
         return  res.status(401).json({message : "UnAuthorized - No token Provided"});
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    if(!decoded){
          return  res.status(401).json({message : "UnAuthorized - Invalid token"});
    }

    const user = await User.findById(decoded.userId).select("-password");
    if(!user){
       return  res.status(404).json({message : "User not found"});
    }
    req.user = user;
    next();
    } catch (error) {
        console.log(`Error in protectroute middleware : ${error}`);
        return res.status(500).json({message:"Internal Server Error"});
    }

}