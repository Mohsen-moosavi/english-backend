const { User, Ban, db, Role, Level } = require("./../../db");
const svgCpatcha = require("svg-captcha");
const uuidv4 = require("uuid").v4;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const configs = require("../../configs");
const redis = require("../../redis");
const { validationResult } = require("express-validator");
const { errorResponse, successResponse } = require("../../utils/responses");
const { getOtpDetails, generateOtp, generateVerifiedPhone, getOtpRedisPattern, getBannedPhonePattern, editOtpAttempts, getVerifiedPhonePattern, generateForgetPasswordOtp, getRefreshPasswordOtpRedisPattern, editRefreshPasswordOtpAttempts, getّforgetPassOtpDetails } = require("../../utils/redis.utils");
const { sendSMSOtp } = require("../../services/otp");
const { Op, where } = require("sequelize");
const { generateAccessToken, generateRefreshToken, verifyAccessToken, refreshTokenHandler } = require("../../utils/auth.utils");
const { path } = require("../../app");

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
      return errorResponse(res, 400, `کد فرستاده شده هنوز منقضی نشده. لفطا بعد از ${remainingTime} دقیقه دیگر مجددا تلاش کنید.`);
    }

    const otp = await generateOtp(phone);

    await sendSMSOtp(phone, otp);

    return successResponse(res, 200, `کد با موفقیت ارسال شد`);

  } catch (error) {
    next(error)
  }
}

const resendOtp = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone } = req.body;

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
      return successResponse(res, 400, `کد فرستاده شده هنوز منقضی نشده. لفطا بعد از ${remainingTime} دقیقه دیگر مجددا تلاش کنید.`);
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
      return errorResponse(res, 400, "کد اشتباه است!");
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
        where: { name: 'USER' },
        defaults: { jobs: [''] },
        raw: true
      })
    } else {
      userRole = await Role.findOrCreate({
        where: { name: 'MANAGER' },
        defaults: {
          jobs: ['admin']
        },
        raw: true
      })
    }

    console.log('userRole===>', userRole[0])

    const hashedPassword = bcrypt.hashSync(password, 12)


    const accessToken = generateAccessToken(username)
    const refreshToken = generateRefreshToken(username)

    const newUser = await User.create({
      name,
      username,
      phone,
      refreshToken,
      password: hashedPassword,
      role_id: userRole[0].id
    })


    res.cookie('accessToken', accessToken, {
      origin: configs.originDomain.frontUserDomain,
      secure: true,
      path: '/',
      maxAge: configs.auth.accessTokenExpiresInSeconds * 1000
    })

    const accessTokenExpireTime = Date.now() + configs.auth.accessTokenExpiresInSeconds * 1000
    res.cookie('expireTime', accessTokenExpireTime, {
      origin: configs.originDomain.frontUserDomain,
      secure: true,
      path: '/',
    })

    res.cookie('refreshToken', refreshToken, {
      origin: configs.originDomain.frontUserDomain,
      secure: true,
      httpOnly: true,
      path: '/api/v1/auth/',
      maxAge: configs.auth.refreshTokenExpiresInSeconds * 1000
    })

    const userData =  {
      avatar : null,
      name: newUser.name,
      phone: newUser.phone,
      score:newUser.score,
      level:newUser.level || null,
      role:newUser.role?.name || userRole[0].name
    }

    successResponse(res, 201, 'شما با موفقیت ثبت نام شدید.',{user : userData})
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

    const user = await User.findOne(
      { where: { phone },
      include: [
        {
          model: Role,
          attributes: ['name'],
          as: 'role'
        },
        {
          model: Level,
          attributes: ['name'],
          as: 'level',
          required : false
        }
      ],
    })

    if (!user) {
      return errorResponse(res, 401, 'کاربری با این اطلاعات یافت نشد.')
    }

    const isValidPassword = bcrypt.compareSync(password, user.password)

    if (!isValidPassword) {
      return errorResponse(res, 401, 'کاربری با این اطلاعات یافت نشد.')
    }

    console.log("cookies===>", req.cookies)

    const accessToken = generateAccessToken(user.username)
    const refreshToken = generateRefreshToken(user.username)

    user.refreshToken = refreshToken;
    await user.save()

    res.cookie('accessToken', accessToken, {
      origin: configs.originDomain.frontUserDomain,
      secure: true,
      path: '/',
      maxAge: configs.auth.accessTokenExpiresInSeconds * 1000
    })

    const accessTokenExpireTime = Date.now() + configs.auth.accessTokenExpiresInSeconds * 1000
    res.cookie('expireTime', accessTokenExpireTime, {
      origin: configs.originDomain.frontUserDomain,
      secure: true,
      path: '/',
    })

    res.cookie('refreshToken', refreshToken, {
      origin: configs.originDomain.frontUserDomain,
      secure: true,
      httpOnly: true,
      path: '/api/v1/auth/',
      maxAge: configs.auth.refreshTokenExpiresInSeconds * 1000
    })

    const userData =  {
      name: user.name,
      phone: user.phone,
      avatar:user.avatar,
      score:user.score,
      level:user.level || null,
      role:user.role?.name || null
    }

    successResponse(res, 200, 'شما با موفقیت وارد شدید.',{user : userData})

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

    const { phone, uuid, captcha } = req.body;

    const redisCaptcha = await redis.get(`captcha:${uuid}`)
    if (redisCaptcha !== captcha) {
      await redis.del(`captcha:${uuid}`)
      return errorResponse(res, 422, "کد امنیتی اشتباه است.")
    }

    const user = await User.findOne({ where: { phone } })

    if (!user) {
      await redis.del(`captcha:${uuid}`)
      return errorResponse(res, 401, 'کاربری با این اطلاعات یافت نشد.')
    }

    const banPhoneForVerified = await redis.get(getBannedPhonePattern(phone))

    if (banPhoneForVerified) {
      await redis.del(`captcha:${uuid}`)
      return errorResponse(res, 429, "لطفا بعدا تلاش کنید.")
    }

    const { expired, remainingTime } = await getّforgetPassOtpDetails(phone)

    if (!expired) {
      await redis.del(`captcha:${uuid}`)
      return successResponse(res, 409, `کد فرستاده شده هنوز منقضی نشده. لفطا بعد از ${remainingTime} دقیقه دیگر مجددا تلاش کنید.`);
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
    console.log("redisOtp====>", await redis.keys("*"))
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

    const user = await User.findOne({ where: { phone } })
    if (!user) {
      return errorResponse(res, 400, "مشکل در تشخیص شماره تلفن!")
    }

    const hashedPassword = bcrypt.hashSync(password, 12)

    const accessToken = generateAccessToken(user.username)
    const refreshToken = generateRefreshToken(user.username)

    user.password = hashedPassword;
    user.refreshToken = refreshToken;
    user.save()

    res.cookie('accessToken', accessToken, {
      origin: configs.originDomain.frontUserDomain,
      secure: true,
      path: '/',
      maxAge: configs.auth.accessTokenExpiresInSeconds * 1000
    })

    const accessTokenExpireTime = Date.now() + configs.auth.accessTokenExpiresInSeconds * 1000
    res.cookie('expireTime', accessTokenExpireTime, {
      origin: configs.originDomain.frontUserDomain,
      secure: true,
      path: '/',
    })

    res.cookie('refreshToken', refreshToken, {
      origin: configs.originDomain.frontUserDomain,
      secure: true,
      httpOnly: true,
      path: '/api/v1/auth/',
      maxAge: configs.auth.refreshTokenExpiresInSeconds * 1000
    })

    successResponse(res, 200, 'رمز عبور شما، با موفقیت ویرایش شد.')
  } catch (error) {
    next(error)
  }
}

const getCaptcha = async (req, res, next) => {
  try {

    const { uuid } = req.body;
    console.log("uuid==============================>" , uuid)

    if (uuid) {
      await redis.del(`captcha:${uuid}`);
    }

    console.log("keys===>", await redis.keys("*"))

    const captcha = svgCpatcha.create({
      size: 5,
      noise: 5,
      fontSize: 50,
      width: 100,
      height: 50,
    });

    const newUuid = uuidv4();

    await redis.set(`captcha:${newUuid}`, captcha.text.toLowerCase(), "EX", 60 * 5);

    return successResponse(res, 200, 'کد کپچا با موفقیت ایجاد شد.', { uuid: newUuid, captcha: captcha.data })
  } catch (error) {
    next(error)
  }
}

const resendForgetpassOtp = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone } = req.body;

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

    if (!oldUser) {
      return errorResponse(res, 409, "کاربر یافت نشد!")
    }

    const banPhoneForVerified = await redis.get(getBannedPhonePattern(phone))

    if (banPhoneForVerified) {
      return errorResponse(res, 429, "لطفا بعدا تلاش کنید.")
    }

    const { expired, remainingTime } = await getّforgetPassOtpDetails(phone)

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

const loginAdmins = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { phone, password } = req.body;

    const user = await User.findOne({
      where: { phone },
      include: [
        {
          model: Role,
          attributes: ['name'],
          as: 'role'
        }
      ],
    })

    if (!user) {
      return errorResponse(res, 401, 'کاربری با این اطلاعات یافت نشد.')
    }

    if (user['role.name'] === 'USER') {
      return errorResponse(res, 401, 'شما مجاز به ورود نیستید!')
    }

    const isValidPassword = bcrypt.compareSync(password, user.password)

    if (!isValidPassword) {
      return errorResponse(res, 401, 'کاربری با این اطلاعات یافت نشد.')
    }

    const accessToken = generateAccessToken(user.username)
    const refreshToken = generateRefreshToken(user.username)

    user.refreshToken = refreshToken;

    user.save();

    res.cookie('accessToken', accessToken, {
      origin: configs.originDomain.frontAdminDomain,
      secure: true,
      path: '/',
      expired: configs.auth.accessTokenExpiresInSeconds * 1000
    })

    const accessTokenExpireTime = Date.now() + configs.auth.accessTokenExpiresInSeconds * 1000
    res.cookie('expireTime', accessTokenExpireTime, {
      origin: configs.originDomain.frontAdminDomain,
      secure: true,
      path: '/',
    })

    res.cookie('refreshToken', refreshToken, {
      origin: configs.originDomain.frontAdminDomain,
      secure: true,
      httpOnly: true,
      path: '/api/v1/auth/',
      maxAge: configs.auth.refreshTokenExpiresInSeconds * 1000
    })

    successResponse(res, 200, 'شما با موفقیت وارد شدید.')

  } catch (error) {
    next(error)
  }
}

const getMe = async (req, res, next) => {
  try {

    const user = req.user;

    successResponse(res,200,"", {user})
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const isAdmin = req.query.admin
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return errorResponse(res, 401, "مشکل در احراز کاربر");
    const refreshToken = cookies.refreshToken;
    res.clearCookie('refreshToken');
    
    let foundUser;
    if(isAdmin){
      const userRole = await Role.findOne({ where: { name : 'USER' }});
      foundUser = await User.findOne({ where: { refreshToken , role_id : {[Op.notLike] : `${userRole?._id ? userRole?._id : ''}`}}});
      console.log('user refrshToken==============================================>' ,refreshToken )
    }else{
      foundUser = await User.findOne({ where: { refreshToken }});
    }




    // Detected refresh token reuse!
    if (!foundUser) {
      jwt.verify(
        refreshToken,
        configs.auth.refreshTokenSecretKey,
        async (err, decoded) => {
          if (err) return errorResponse(res, 401, "مشکل در احراز کاربر");
          const hackedUser = await User.findOne({ where: { username: decoded.username } });
          if (hackedUser) {
            hackedUser.refreshToken = '';
            hackedUser.save()
          }
        }
      )
      return errorResponse(res, 401, "مشکل در احراز کاربر");
    }

    if(isAdmin && foundUser['role.name'] === 'USER'){
      return errorResponse(res, 401, "مشکل در احراز کاربر");
    }


    // const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

    // evaluate jwt 
    jwt.verify(
      refreshToken,
      configs.auth.refreshTokenSecretKey,
      async (err, decoded) => {
        if (err) {
          console.log('expired refresh token')
          foundUser.refreshToken = '';
          await foundUser.save();
        }
        if (err || foundUser.username !== decoded.username) return errorResponse(res, 401, "مشکل در احراز کاربر");

        // Refresh token was still valid
        const accessToken = generateAccessToken(foundUser.username)
        const newRefreshToken = generateRefreshToken(foundUser.username)

        // Saving refreshToken with current user
        foundUser.refreshToken = newRefreshToken;
        const result = await foundUser.save();
        
        const accessTokenExpireTime = Date.now() + configs.auth.accessTokenExpiresInSeconds * 1000
        res.cookie('accessToken', accessToken, {
          origin: isAdmin ? configs.originDomain.frontAdminDomain : configs.originDomain.frontUserDomain,
          secure: true,
          path: '/',
          maxAge: configs.auth.accessTokenExpiresInSeconds * 1000
        })
    
        res.cookie('expireTime', accessTokenExpireTime, {
          origin: isAdmin ? configs.originDomain.frontAdminDomain : configs.originDomain.frontUserDomain,
          secure: true,
          path: '/',
        })
    
        res.cookie('refreshToken', newRefreshToken, {
          origin: isAdmin ? configs.originDomain.frontAdminDomain : configs.originDomain.frontUserDomain,
          secure: true,
          httpOnly: true,
          path: '/api/v1/auth/',
          maxAge: configs.auth.refreshTokenExpiresInSeconds * 1000
        })
    
        successResponse(res, 200)
      }
    );

  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
        // On client, also delete the accessToken

        const cookies = req.cookies;
        if (!cookies?.refreshToken) return successResponse(res,204,"توکنی وجود ندارد!"); //No content
        const refreshToken = cookies.refreshToken;
    
        // Is refreshToken in db?
        const foundUser = await User.findOne({where : { refreshToken }});
        if (!foundUser) {
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            res.clearCookie('expireTime');
            return successResponse(res,204,'کاربری یافت نشد.');
        }
    
        // Delete refreshToken in db
        foundUser.refreshToken = ''
        await foundUser.save();
    
        res.cookie('refreshToken', refreshToken, {
          secure: true,
          httpOnly: true,
          path: '/api/v1/auth/',
          maxAge: 0
        })
        res.clearCookie('accessToken');
        res.clearCookie('expireTime');
        successResponse(res,204,'با موفقیت از حساب کاربری خارج شدید.');
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
  getCaptcha,
  loginAdmins,
  resendForgetpassOtp,
  getMe,
  refreshToken,
  logout
}