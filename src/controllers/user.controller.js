import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRespose } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary }  from  "../utils/Cloudinary.js";

const registerUser = asyncHandler( async (req, res)=>{
    
    const {fullName, email, userName, password, phone, country} = req.body;

    console.log("fullName ", fullName);

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


export { registerUser }