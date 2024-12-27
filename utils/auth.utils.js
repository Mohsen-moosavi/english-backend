const jwt = require("jsonwebtoken")
const configs = require("../configs")
const { errorResponse } = require("./responses")

function generateAccessToken(username){
    return jwt.sign({ username}, configs.auth.accessTokenSecretKey, {
        expiresIn: `${configs.auth.accessTokenExpiresInSeconds}s`,
    })
}

function generateRefreshToken(username){
    return jwt.sign({ username}, configs.auth.refreshTokenSecretKey, {
        expiresIn: `${configs.auth.refreshTokenExpiresInSeconds}s`,
    })
}

function verifyAccessToken(token){
    try {
        return jwt.verify(token,configs.auth.accessTokenSecretKey)        
    } catch (error) {
        return false
    }
}


function verifyRefreshToken(token){
    try {
        return jwt.verify(token,configs.auth.refreshTokenExpiresInSeconds)        
    } catch (error) {
        return false
    }
}

async function refreshTokenHandler(req,res,User){
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return false
  const refreshToken = cookies.refreshToken;
  res.clearCookie('refreshToken');

  const foundUser = await User.findOne({ where: { refreshToken } });


  // Detected refresh token reuse!
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      configs.auth.refreshTokenSecretKey,
      async (err, decoded) => {
        if (err) return false
        const hackedUser = await User.findOne({ where: { username: decoded.username } });
        if (hackedUser) {
          hackedUser.refreshToken = '';
          hackedUser.save()
        }
      }
    )
    return false
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
      if (err || foundUser.username !== decoded.username) return false

      // Refresh token was still valid
      const accessToken = generateAccessToken(foundUser.username)
      const newRefreshToken = generateRefreshToken(foundUser.username)

      // Saving refreshToken with current user
      foundUser.refreshToken = newRefreshToken;
      await foundUser.save();

      const accessTokenExpireTime = Date.now() + configs.auth.accessTokenExpiresInSeconds * 1000;

      console.log('here=======================================')
      return accessToken
    }
  );
}

module.exports = { 
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    refreshTokenHandler
}