const express = require("express");
const cors = require("cors");
const corsOrigin = require("./middlewares/headers.middleware");
const fs = require("fs");
const path = require("path");

// const captchaController = require("./controllers/captcha");

const app = express();

app.use(corsOrigin);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "public")));

app.get('/' , (req,res)=>{
    res.json({message : "hello"})
})

module.exports = app;
