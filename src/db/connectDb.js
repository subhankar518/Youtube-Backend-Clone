import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB= async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB Connected Successfully ! DB Host: ${connectionInstance.connection.host}`); // This is for checking our server prod or dev
        // console.log("connectionInstance ", connectionInstance)
    } catch (error) {
        console.log("MongoDB Connection Error: ",error);
        process.exit(1);
    }
}