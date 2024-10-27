const { User, Ban, db, Role } = require("./../../db");
const svgCpatcha = require("svg-captcha");
const uuidv4 = require("uuid").v4;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const configs = require("../../configs");
const redis = require("../../redis");
const { validationResult } = require("express-validator");
const { errorResponse, successResponse } = require("../../utils/responses");
const { getOtpDetails, generateOtp, generateVerifiedPhone, getOtpRedisPattern, getBannedPhonePattern, editOtpAttempts, getVerifiedPhonePattern, getRefreshPasswordOtpDetails, generateForgetPasswordOtp, getRefreshPasswordOtpRedisPattern, editRefreshPasswordOtpAttempts } = require("../../utils/redis.utils");
const { sendSMSOtp } = require("../../services/otp");
const { Op, where } = require("sequelize");
const { generateAccessToken, generateRefreshToken } = require("../../utils/auth.utils");

const sendOtp = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone, captcha, uuid } = req.body;

    const redisCaptcha = await redis.get(`captcha:${uuid}`)
    if (redisCaptcha !== captcha) {
      await redis.del(`captcha:${uuid}`)
      return errorResponse(res, 422, "کد امنیتی اشتباه است.")
    }

    const banPhone = await Ban.findOne({
      attributes: ["id"],
      where: { phone }
    })

    if (banPhone) {
      await redis.del(`captcha:${uuid}`)
      return errorResponse(res, 422, "این شماره تلفن، مسدود شده است!")
    }

    const oldUser = await User.findOne({
      attributes: ["id"],
      where: { phone }
    })

    if (oldUser) {
      await redis.del(`captcha:${uuid}`)
      return errorResponse(res, 409, "این شماره تلفن، قبلا ثبت شده است!")
    }

    const banPhoneForVerified = await redis.get(getBannedPhonePattern(phone))

    if (banPhoneForVerified) {
      await redis.del(`captcha:${uuid}`)
      return errorResponse(res, 429, "لطفا بعدا تلاش کنید.")
    }

    const { expired, remainingTime } = await getOtpDetails(phone)

    if (!expired) {
      return successResponse(res, 200, `کد فرستاده شده هنوز منقضی نشده. لفطا بعد از ${remainingTime} دقیقه دیگر مجددا تلاش کنید.`);
    }

    const otp = await generateOtp(phone);

    await sendSMSOtp(phone, otp);

    return successResponse(res, 200, `کد با موفقیت ارسال شد`);

  } catch (error) {
    next(error)
  }
}

const resendOtp = async (req,res,next)=>{
  try{
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone} = req.body;

    const banPhone = await Ban.findOne({
      attributes: ["id"],
      where: { phone }
    })

    if (banPhone) {
      return errorResponse(res, 422, "این شماره تلفن، مسدود شده است!")
    }

    const oldUser = await User.findOne({
      attributes: ["id"],
      where: { phone }
    })

    if (oldUser) {
      return errorResponse(res, 409, "این شماره تلفن، قبلا ثبت شده است!")
    }

    const banPhoneForVerified = await redis.get(getBannedPhonePattern(phone))

    if (banPhoneForVerified) {
      await redis.del(`captcha:${uuid}`)
      return errorResponse(res, 429, "لطفا بعدا تلاش کنید.")
    }

    const { expired, remainingTime } = await getOtpDetails(phone)

    if (!expired) {
      return successResponse(res, 200, `کد فرستاده شده هنوز منقضی نشده. لفطا بعد از ${remainingTime} دقیقه دیگر مجددا تلاش کنید.`);
    }

    const otp = await generateOtp(phone);

    await sendSMSOtp(phone, otp);

    return successResponse(res, 200, `کد با موفقیت ارسال شد`);
  } catch (error) {
    next(error)
  }
}

const verifyCode = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone, code } = req.body;


    const redisOtp = await redis.get(getOtpRedisPattern(phone));
    const [savedOtp, attempts] = redisOtp?.split(',') || []

    if (!savedOtp) {
      return errorResponse(res, 400, "مشکل در شناسایی شماره تلفن");
    }

    if (attempts > 4) {
      await redis.set(getBannedPhonePattern(phone), phone, 'EX', 5 * 60)
      return errorResponse(res, 429, "تعداد دفعات مجاز برای وارد کردن کد، به پایان رسیده است.")
    }

    await editOtpAttempts(phone)

    const otpIsCorrect = await bcrypt.compare(code, savedOtp);

    if (!otpIsCorrect) {
      return errorResponse(res, 400, "کد نادرست است!");
    }

    const verifiedPhoneCode = await generateVerifiedPhone(phone)

    await redis.del(getOtpRedisPattern(phone))

    return successResponse(res, 200, "شماره تلفن با موفقیت احراز شد", { verifiedPhoneCode });
  } catch (err) {
    next(err);
  }
}

const register = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone, name, username, password, verifiedPhoneCode } = req.body;

    const validPhone = await redis.get(getVerifiedPhonePattern(phone, verifiedPhoneCode))
    if (!validPhone) {
      return errorResponse(res, 400, "مشکل در تشخیص شماره تلفن!")
    }

    const olduser = await User.findOne({
      where: { [Op.or]: [{ username }, { phone }] },
      raw: true
    })

    console.log('oldUser===>', olduser)

    if (olduser) {
      if (olduser.username === username) {
        return errorResponse(res, 409, "این نام کاربری، قبلا ثبت شده است!")
      }
      return errorResponse(res, 409, "این شماره تلفن، قبلا ثبت شده است!")
    }

    const userCount = await User.count()

    console.log('user===>', userCount)

    let userRole;

    if (userCount > 0) {
      userRole = await Role.findOrCreate({
        where: { name: 'user' },
        defaults: { jobs: [''] },
        raw: true
      })
    } else {
      userRole = await Role.findOrCreate({
        where: { name: 'manager' },
        defaults: {
          jobs: ['admin']
        },
        raw: true
      })
    }

    console.log('userRole===>', userRole[0])

    const hashedPassword = bcrypt.hashSync(password, 12)

    await User.create({
      name,
      username,
      phone,
      password: hashedPassword,
      role_id: userRole[0].id
    })

    const accessToken = generateAccessToken(username)
    const RefreshToken = generateRefreshToken(username)

    successResponse(res, 201, 'شما با موفقیت ثبت نام شدید.', { accessToken, RefreshToken })
  } catch (err) {
    next(err);
  }
}

const login = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone, password } = req.body;

    const user = await User.findOne({ phone })

    if (!user) {
      return errorResponse(res, 401, 'کاربری با این اطلاعات یافت نشد.')
    }

    const isValidPassword = bcrypt.compareSync(password, user.password)

    if (!isValidPassword) {
      return errorResponse(res, 401, 'کاربری با این اطلاعات یافت نشد.')
    }

    const accessToken = generateAccessToken(user.username)
    const RefreshToken = generateRefreshToken(user.username)

    successResponse(res, 200, 'شما با موفقیت وارد شدید.', { accessToken, RefreshToken })

  } catch (error) {
    next(error)
  }
}

const forgetPassword = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone } = req.body;

    const user = await User.findOne({ where: { phone } })


    if (!user) {
      return errorResponse(res, 401, 'کاربری با این اطلاعات یافت نشد.')
    }

    const banPhoneForVerified = await redis.get(getBannedPhonePattern(phone))

    if (banPhoneForVerified) {
      return errorResponse(res, 429, "لطفا بعدا تلاش کنید.")
    }

    const { expired, remainingTime } = await getRefreshPasswordOtpDetails(phone)

    if (!expired) {
      return successResponse(res, 200, `کد فرستاده شده هنوز منقضی نشده. لفطا بعد از ${remainingTime} دقیقه دیگر مجددا تلاش کنید.`);
    }

    const otp = await generateForgetPasswordOtp(phone);

    await sendSMSOtp(phone, otp);

    return successResponse(res, 200, `کد با موفقیت ارسال شد`);

  } catch (error) {
    next(error)
  }
}

const verifyForgetPasswordOtp = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone, code } = req.body;


    const redisOtp = await redis.get(getRefreshPasswordOtpRedisPattern(phone));
    const [savedOtp, attempts] = redisOtp?.split(',') || []

    if (!savedOtp) {
      return errorResponse(res, 400, "مشکل در شناسایی شماره تلفن");
    }

    if (attempts > 4) {
      await redis.set(getBannedPhonePattern(phone), phone, 'EX', 5 * 60)
      return errorResponse(res, 429, "تعداد دفعات مجاز برای وارد کردن کد، به پایان رسیده است.")
    }

    await editRefreshPasswordOtpAttempts(phone)

    const otpIsCorrect = await bcrypt.compare(code, savedOtp);

    if (!otpIsCorrect) {
      return errorResponse(res, 400, "کد نادرست است!");
    }

    const verifiedPhoneCode = await generateVerifiedPhone(phone)

    await redis.del(getRefreshPasswordOtpRedisPattern(phone))

    return successResponse(res, 200, "شماره تلفن با موفقیت احراز شد", { verifiedPhoneCode });
  } catch (err) {
    next(err);
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone, password, verifiedPhoneCode } = req.body;

    const validPhone = await redis.get(getVerifiedPhonePattern(phone, verifiedPhoneCode))
    if (!validPhone) {
      return errorResponse(res, 400, "مشکل در تشخیص شماره تلفن!")
    }

    const user = await User.findOne({ phone })
    if (!user) {
      return errorResponse(res, 400, "مشکل در تشخیص شماره تلفن!")
    }

    const hashedPassword = bcrypt.hashSync(password, 12)

    user.password = hashedPassword;
    user.save()

    const accessToken = generateAccessToken(user.username)
    const RefreshToken = generateRefreshToken(user.username)

    successResponse(res, 200, 'شما با موفقیت ثبت نام شدید.', { accessToken, RefreshToken })
  } catch (error) {
    next(error)
  }
}

const getCaptcha = async (req, res, next) => {
  try {

    const { uuid } = req.body;

    if (uuid) {
      await redis.del(`captcha:${uuid}`);
    }

    console.log("keys===>",await redis.keys("*"))

    const captcha = svgCpatcha.create({
      size: 5,
      noise: 5,
      fontSize: 50,
      width: 100,
      height: 50,
    });

    const newUuid = uuidv4();

    await redis.set(`captcha:${newUuid}`, captcha.text.toLowerCase(), "EX", 60 * 5);

    return successResponse(res, 200, 'کد کپچا با موفقیت ایجاد شد.', { uuid : newUuid, captcha: captcha.data })
  } catch (error) {
    next(error)
  }
}




module.exports = {
  sendOtp,
  resendOtp,
  verifyCode,
  register,
  login,
  forgetPassword,
  verifyForgetPasswordOtp,
  resetPassword,
  getCaptcha
}