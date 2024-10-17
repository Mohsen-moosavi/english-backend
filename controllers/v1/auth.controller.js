const {User , Ban, db, Role} = require("./../../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const configs = require("../../configs");
const redis = require("../../redis");
const { validationResult } = require("express-validator");
const { errorResponse, successResponse } = require("../../utils/responses");
const { getOtpDetails, generateOtp, generateVerifiedPhone, getOtpRedisPattern, getBannedPhonePattern, editOtpAttempts, getVerifiedPhonePattern } = require("../../utils/redis.utils");
const { sendSMSOtp } = require("../../services/otp");
const { Op } = require("sequelize");
const { generateAccessToken, generateRefreshToken } = require("../../utils/auth.utils");

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

const register = async (req,res,next)=>{
  try{
    const validationError = validationResult(req)

    if(validationError?.errors && validationError?.errors[0]){
      return errorResponse(res,400,validationError.errors[0].msg)
    }

    const {phone, name, username, password} = req.body;

    const validPhone = await redis.get(getVerifiedPhonePattern(phone))
    if(!validPhone){
      return errorResponse(res,400,"مشکل در تشخیص شماره تلفن!")
    }

    const olduser = await User.findOne({
      where : {[Op.or] : [{username} ,{phone}]},
      raw : true
    })

    console.log('oldUser===>' , olduser)

    if(olduser){
      if(olduser.username === username){
        return errorResponse(res,409,"این نام کاربری، قبلا ثبت شده است!")
      }
      return errorResponse(res,409,"این شماره تلفن، قبلا ثبت شده است!")
    }

    const userCount = await User.count()

    console.log('user===>' , userCount)

    let userRole;

    if(userCount > 0){
      userRole = await Role.findOrCreate({
        where : {name : 'user'},
        defaults : {jobs : ['']},
        raw : true
      })
    }else{
      userRole = await Role.findOrCreate({
        where : {name : 'manager'},
        defaults : {
          jobs : ['admin']
        },
        raw : true
      })
    }

    console.log('userRole===>' , userRole[0])

    const hashedPassword = bcrypt.hashSync(password,12)

    const newUser = await User.create({
      name,
      username,
      phone,
      password : hashedPassword,
      role_id : userRole[0].id
    })

    const accessToken = generateAccessToken(username)
    const RefreshToken = generateRefreshToken(username)

    successResponse(res,201,'شما با موفقیت ثبت نام شدید.',{accessToken , RefreshToken})
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendOtp,
  verifyCode,
  register
}