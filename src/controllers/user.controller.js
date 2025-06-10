import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRespose } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary }  from  "../utils/Cloudinary.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler( async (req, res)=>{
    
    const {fullName, email, userName, password, phone, country} = req.body;

    if([fullName, email, userName, password, phone, country].some((fields)=>{
        return fields?.trim() === "";
    })){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.find({
        $or: [{userName}, {email}, {phone}]
    })

    if(existedUser.length){
        throw new ApiError(409, "User with this username, email or phone already exist");
    }

    const uploadedfiles = req.files;

    const avatarLocalPath =uploadedfiles?.avatar && uploadedfiles?.avatar[0]?.path;
    const coverImageLocalPath =uploadedfiles?.coverImage && uploadedfiles?.coverImage[0]?.path;



    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is required")
    }

    const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
    
    let coverImageUploadResponse;
    if(coverImageLocalPath){
        coverImageUploadResponse= await uploadOnCloudinary(coverImageLocalPath);
    }

    if(!avatarUploadResponse)
    {
        throw new ApiError(400,"Avatar file is not uploaded properly");
    }

    const userResponse= await User.create({
        fullName,
        email,
        userName: userName.toLowerCase(),
        password,
        phone,
        country,
        avatar: avatarUploadResponse && avatarUploadResponse.url,
        coverImage: (coverImageLocalPath && coverImageUploadResponse) ? coverImageUploadResponse.url : ""
    })

    if (!userResponse) {
    throw new ApiError(500, "Something went wrong while registering the User");
    }

    // console.log("userResponse :", userResponse);

    // Converting the Mongoose document to a plain js object
    const userObject = userResponse.toObject();

    const { password: _, refreshToken, ...userWithoutSensitiveFields } = userObject;

    // console.log("userWithoutSensitiveFields :", userWithoutSensitiveFields)

    return res.status(201).json(
        new ApiRespose(200, userWithoutSensitiveFields, "User registered Successfully")
    );
       
    // res.status(200).json({
    //     message: "testing api...!!!"
    // })
})

const loginUser = asyncHandler( async (req, res) => {
    const {email, userName, password, phone} = req.body;

    if(!(userName || email || phone)){
        throw new ApiError(400, "Username or Password or Phone");
    }

    const existedUser = await User.findOne({
        $or: [{userName}, {email}, {phone}]
    })

    if(!existedUser){
        throw new ApiError(404, "User not registered");
    }

    // Remember here we can't use mongoose User, we need to use registerd user object for accessing custom methods.
    const isPasswordValid = await existedUser.isPasswordCurrect(password);  

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials");
    }

    const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshToken(existedUser);

    // Optional step
    const updatedUser = await  User.findById(existedUser._id).select("-password -refreshToken");

    // this is for sercure cookie, only editable from server
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
              .cookie("accessToken", newAccessToken, options) // for seting tokens in browser
              .cookie("RefreshToken", newRefreshToken, options)
              .json(new ApiRespose(200,
                {
                    user: updatedUser, newAccessToken, newRefreshToken
                },
                "User logged in Successfully"
              ))

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, 
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true // for ensure the work done
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
              .clearCookie("accessToken", options)
              .clearCookie("RefreshToken", options)
              .json(new ApiRespose(200, {}, "User logged Out"));
})

const newAccessTokenRequest = asyncHandler( async (req, res) => {
    try {
        const incomingRefreshToken = req.cookie?.refreshToken || req.body?.refreshToken // for mobile app user does not have cookie
    
        if(!incomingRefreshToken)
        {
            throw new ApiRespose(401, "Unauthorized Request");
        }
    
        const decordedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        if(!decordedToken)
        {
            throw new ApiRespose(401, "Invalid Refresh token");
        }
    
        const user = await User.findById(decordedToken?._id);
    
        if(!user)
        {
            throw new ApiRespose(401, "Invalid Refresh token");
        }
    
        if(incomingRefreshToken !== user.refreshToken)
        {
            throw new ApiRespose(401, "Invalid Refresh token");
        }
    
        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshToken(user);
    
        // this is for sercure cookie, only editable from server
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res.status(200)
                  .cookie("accessToken", newAccessToken, options) // for seting tokens in browser
                  .cookie("RefreshToken", newRefreshToken, options)
                  .json(new ApiRespose(200,
                    {
                        accessToken: newAccessToken, RefreshToken: newRefreshToken
                    },
                    "Access token refreshed"
                  ))
    } catch (error) {
        throw new ApiError(401,"Invalid Refresh token");
    }
})


const generateAccessAndRefreshToken = async(user) => {
    try {
        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken(); 

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false}); // for preventing of instant kickin of other field, Ex: password

        return { newAccessToken, newRefreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while genwrating refresh and access token");
    }
} 


export { registerUser, loginUser, logoutUser, newAccessTokenRequest }