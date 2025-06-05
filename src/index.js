import { connectDB } from "./db/connectDb.js";
import dotenv from "dotenv"

// require('dotenv').config({path: './env'}) this will work fine but we will not use it.

dotenv.config({
    path: './env'
})

connectDB();



/*

import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app= express();
const port= process.env.PORT;

(async ()=>{  // this is the "if e" syntax with async await for immediate runing  
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       app.on("error: ",(error)=>{
        console.log("ERROR: ",error);
        throw error;
       })
       app.listen(port, ()=>{
        console.log(`DB connected, app is runing on ${port}`)
       })
    } catch (error) {
        console.error("ERROR: ",error);
        throw error;
        
    }
})();

*/