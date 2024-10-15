const {User , Ban} = require("./../../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const configs = require("../../configs");
const redis = require("../../redis");
const { validationResult } = require("express-validator");
const { errorResponse, successResponse } = require("../../utils/responses");
const { getOtpDetails, generateOtp, generateVerifiedPhone, getOtpRedisPattern, getBannedPhonePattern, editOtpAttempts } = require("../../utils/redis.utils");
const { sendSMSOtp } = require("../../services/otp");

const sendOtp = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if(validationError?.errors && validationError?.errors[0]){
      return errorResponse(res,400,validationError.errors[0].msg)
    }

    const { phone } = req.body;


    const banPhone = await Ban.findOne({
      attributes : ["id"],
      where : {phone}
    })

    if(banPhone){
      return errorResponse(res,422,"این شماره تلفن، مسدود شده است!")
    }

    const oldUser = await User.findOne({
      attributes : ["id"],
      where : {phone}
    })

    if(oldUser){
      return errorResponse(res,409,"این شماره تلفن، قبلا ثبت شده است!")
    }

    const banPhoneForVerified = await redis.get(getBannedPhonePattern(phone))

    if(banPhoneForVerified){
      return errorResponse(res,429,"لطفا بعدا تلاش کنید.")
    }

    const {expired, remainingTime} =await getOtpDetails(phone)

    if (!expired) {
      return successResponse(res,200,`کد فرستاده شده هنوز منقضی نشده. لفطا بعد از ${remainingTime} دقیقه دیگر مجددا تلاش کنید.`);
    }

    const otp = await generateOtp(phone);

    await sendSMSOtp(phone , otp);

    return successResponse(res,200,`کد با موفقیت ارسال شد`);

  } catch (error) {
    next(error)
  }
}

const verifyCode = async (req,res,next)=>{
  try {
    const validationError = validationResult(req)

    if(validationError?.errors && validationError?.errors[0]){
      return errorResponse(res,400,validationError.errors[0].msg)
    }

    const { phone, code } = req.body;


    const redisOtp = await redis.get(getOtpRedisPattern(phone));
    const [savedOtp , attempts] = redisOtp?.split(',') || []

    if (!savedOtp) {
      return errorResponse(res, 400, "مشکل در شناسایی شماره تلفن");
    }

    if(attempts > 4){
      await redis.set(getBannedPhonePattern(phone) , phone , 'EX' , 5 * 60)
      return errorResponse(res,429,"تعداد دفعات مجاز برای وارد کردن کد، به پایان رسیده است.")
    }

    await editOtpAttempts(phone)

    const otpIsCorrect = await bcrypt.compare(code, savedOtp);

    if (!otpIsCorrect) {
      return errorResponse(res, 400, "کد نادرست است!");
    }

     await generateVerifiedPhone(phone)

     await redis.del(getOtpRedisPattern(phone))

    return successResponse(res, 200 ,"شماره تلفن با موفقیت احراز شد");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendOtp,
  verifyCode
}