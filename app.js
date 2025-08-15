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
const { exec } = require("child_process");
const archiver = require("archiver");
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

// backup
app.get("/backup-volume", (req, res) => {
  const fileName = `volume-backup-${Date.now()}.zip`;
  const zipPath = path.join(__dirname, "public", fileName); // ذخیره در Volume

  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    res.download(zipPath, fileName, (err) => {
      if (!err) fs.unlinkSync(zipPath); // فایل zip رو بعد از دانلود حذف می‌کنیم
    });
  });

  archive.on("error", (err) => {
    console.error("خطا در zip:", err);
    res.status(500).send("❌ خطا در گرفتن بک‌آپ");
  });

  archive.pipe(output);
  archive.directory("public/", false);
  archive.finalize();
});

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
