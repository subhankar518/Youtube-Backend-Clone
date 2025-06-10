import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// This custom middleware we can use anytime for user authentication
export const verifyJWT = asyncHandler( async (req, res, next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", ""); // for mobile application we can't get token from cookie, thats whay second option valueable
    
        if(!token) {
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const decordedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const currentUser=await User.findById(decordedToken?._id).select("-password -refreshToken"); // we do't want these two field here
    
        if(!currentUser){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = currentUser;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
})
