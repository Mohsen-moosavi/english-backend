const jwt = require("jsonwebtoken");
const { Ban, User, Role, Level } =require("../db");
const { verifyAccessToken } =require("../utils/auth.utils");
const { errorResponse } =require("../utils/responses");
const configs = require("../configs");

async function authMiddleware(req,res,next){
    try {
        const token = req.headers.authorization;
    
        if (!token) {
          return errorResponse(res,401,"توکن یافت نشد!");
        }
    
        const tokenArray = token.split(" ");
        const tokenValue = tokenArray[1];
    
        if (tokenArray[0] !== "Bearer") {
          return errorResponse(
            res,
            401,
            "کلمه کلیدی Bearer در ابتدای header ارسالی یافت نشد!"
          );
        }

        console.log("token======>" , tokenValue)
    
        const decoded = verifyAccessToken(tokenValue)
        // const decoded = jwt.verify(tokenValue , configs.auth.accessTokenSecretKey,async (err,decode)=>{
        //   if(err) {
        //     console.log('error===>' , err)
        //   }

        //   console.log("decode===>" , decode)
        // })
    
        if (!decoded) {
          return errorResponse(res, 401, "توکن معتبر نیست!");
        }
    
        const username = decoded.username;
    
        const user = await User.findOne(
          {
            where : {username},
            attributes : ['name' , 'phone' ,'avatar', 'grate' , 'score'],
            raw:true,
            include: [
              {
                model: Role,
                attributes: ['name'],
                as: 'role'
              },
              {
                model: Level,
                attributes: ['name'],
                as: 'level'
              }
            ],
          });
    
        if (!user) {
          return errorResponse(res, 404, "کاربری یافت نشد!");
        }
    
        const isBanned = await Ban.findOne({ phone: user.phone });
    
        if (isBanned) {
          return errorResponse(res, 403, "کاربر مسدود شده است!");
        }
    
        req.user = user;
    
        next();
      } catch (err) {
        next(err);
      }
}

module.exports = {
  authMiddleware
};