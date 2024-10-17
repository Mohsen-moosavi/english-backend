const jwt = require("jsonwebtoken")
const configs = require("../configs")

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

module.exports = { 
    generateAccessToken,
    generateRefreshToken
}