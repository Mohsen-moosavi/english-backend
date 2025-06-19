const jwt = require("jsonwebtoken");
const { Ban, User, Role, Level } =require("../db");
const { verifyAccessToken } =require("../utils/auth.utils");
const { errorResponse } =require("../utils/responses");
const configs = require("../configs");
const { where } = require("sequelize");

// async function authMiddleware(req,res,next){
//     try {
//         const token = req.headers.authorization;
    
//         if (!token) {
//           return errorResponse(res,401,"توکن یافت نشد!");
//         }
    
//         const tokenArray = token.split(" ");
//         const tokenValue = tokenArray[1];
    
//         if (tokenArray[0] !== "Bearer") {
//           return errorResponse(
//             res,
//             401,
//             "کلمه کلیدی Bearer در ابتدای header ارسالی یافت نشد!"
//           );
//         }
    
//         const decoded = verifyAccessToken(tokenValue)
//         // const decoded = jwt.verify(tokenValue , configs.auth.accessTokenSecretKey,async (err,decode)=>{
//         //   if(err) {
//         //     console.log('error===>' , err)
//         //   }

//         //   console.log("decode===>" , decode)
//         // })
    
//         if (!decoded) {
//           return errorResponse(res, 401, "توکن معتبر نیست!");
//         }
    
//         const username = decoded.username;
    
//         const user = await User.findOne(
//           {
//             where : {username},
//             attributes : ['id','name' , 'phone' ,'avatar' , 'score'],
//             raw:true,
//             include: [
//               {
//                 model: Role,
//                 attributes: ['name'],
//                 as: 'role'
//               },
//               {
//                 model: Level,
//                 attributes: ['name'],
//                 as: 'level',
//                 required : false
//               }
//             ],
//           });
    
//         if (!user) {
//           return errorResponse(res, 404, "کاربری یافت نشد!");
//         }
    
//         const isBanned = await Ban.findOne({ phone: user.phone });
    
//         if (isBanned) {
//           return errorResponse(res, 403, "کاربر مسدود شده است!");
//         }
    
//         req.user = user;
    
//         next();
//       } catch (err) {
//         next(err);
//       }
// }

async function authMiddleware(req, res, next) {
  try {
    let token;

    // 1. تلاش برای دریافت از Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. اگر در هدر نبود، تلاش برای دریافت از کوکی‌ها
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(res, 401, "توکن یافت نشد!");
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return errorResponse(res, 401, "توکن معتبر نیست!");
    }

    const username = decoded.username;
    const user = await User.findOne({
      where: { username },
      attributes: ["id", "name", "phone", "avatar", "score", 'created_at' , 'username'],
      include: [
        { model: Role, attributes: ["name"], as: "role" },
        { model: Level, attributes: ["name"], as: "level", required: false },
      ],
      raw:true
    });

    if (!user) return errorResponse(res, 404, "کاربر یافت نشد!");
    const isBanned = await Ban.findOne({where :{ phone: user.phone }});
    if (isBanned) return errorResponse(res, 403, "کاربر مسدود شده است!");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authMiddleware
};