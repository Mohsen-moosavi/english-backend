const express = require("express");
const corsOrigin = require("./middlewares/headers.middleware");
const fs = require("fs");
const path = require("path");
const allroutes = require("./routes/index.routes");
const {errorResponse} = require('./utils/responses')
const cookieParser = require("cookie-parser")

// const captchaController = require("./controllers/captcha");

const app = express();

app.use(corsOrigin);
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "public")));

app.use("/api/v1",allroutes)


app.use((error,req,res,next)=>{
    if(!error) return next()
    return errorResponse(res,error.status || 500 ,error.message)
})

app.use((req,res)=>{
    return errorResponse(res,404,"آدرس مورد نظر یافت نشد." , null)
})

app.use((error,req,res,next)=>{
    return errorResponse(res,400,error.message , null)
})

module.exports = app;
