const express = require("express");
// const corsOrigin = require("./middlewares/headers.middleware");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const allroutes = require("./routes/index.routes");
const {errorResponse} = require('./utils/responses')
const cookieParser = require("cookie-parser");
const configs = require("./configs");
const { uploadCanceled } = require("./utils/fs.utils");
require('./services/email')

// const captchaController = require("./controllers/captcha");

const app = express();

// app.use(corsOrigin);
app.use(cors({origin:[configs.originDomain.frontAdminDomain , configs.originDomain.frontUserDomain] , credentials : true}))
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/public/files/:filename',(req,res)=>res.download(path.join(__dirname,'public','files',req.params.filename),req.params.filename, (err)=>{if(err){return res.status(404).send('فایل یافت نشد!')}}));
app.use('/public',express.static(path.join(__dirname, "public")));

app.use("/api/v1",allroutes)
app.post('/api/v1/upload-cenceled' , uploadCanceled)


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
