import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // here we are using Cloudinary services / url
            required: true,
        },
        coverImage: {
            type: String, // here we are using Cloudinary services / url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// ********* Remember arrow function can't use this here, that's why normal func used here ********

// here pre hook middleware mainly using for password hash before save to DB 
userSchema.pre("save", async function (next){
    // if(!this.isModified("password")) return next(); different way
    if(this.isModified("password")){
        this.password = bcrypt.hash(this.password, 10);
        next();
    }
})

// Custom methods for schema 
userSchema.methods.isPasswordCurrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}


export const User = mongoose.model("User",userSchema); 