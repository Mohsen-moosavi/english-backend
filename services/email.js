const configs = require("../configs")
const { errorResponse } = require("../utils/responses")
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {user:configs.email.name, pass:configs.email.password}
})

const sendEmailService = async (destinationEmail,message)=>{
    const mailOptions = {
        from : configs.email,
        to: destinationEmail,
        subject: 'پاسخ پیغام شما به مجموعه کلاس زبان',
        text : message
    }
    try {
        const info = await transporter.sendMail(mailOptions)
    } catch (error) {
        return error
    }
}

module.exports = {
    sendEmailService
}