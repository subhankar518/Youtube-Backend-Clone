import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app= express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js" // here we have taken differnt name, we can do that only in export default senario

// Normal URL
// Example URL: http://localhost:8000/users/register

// But the good practice will be versioning of api for feture change
// Example URL: http://localhost:8000/api/v1/users/register


// routes declaration
app.use("/api/v1/users",userRouter);


export { app };