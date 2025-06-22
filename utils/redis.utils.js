const redis = require("../redis");
const bcrypt = require("bcryptjs");

function getOtpRedisPattern(phone) {
    return `otp:${phone}`;
}

function getRefreshPasswordOtpRedisPattern(phone) {
    return `refresh-otp:${phone}`;
}

function getVerifiedPhonePattern(phone , randomCode) {
    return `veified-${randomCode}:${phone}`;
}

function getBannedPhonePattern(phone) {
    return `ban:${phone}`;
}

async function generateVerifiedPhone(phone){
    const randomCode = Math.floor(Math.random() * 10000)
    await redis.set(getVerifiedPhonePattern(phone , randomCode), "0" + phone.slice(3), "EX", 10 * 60);
    return randomCode
} 

async function getExpiredRemainingOtp(otp , remainingTime) {
    if (!otp) {
        return {
            expired: true,
            remainingTime: 0,
        };
    }
    
    const minutes = Math.floor(remainingTime/60)
    const seconds = remainingTime % 60; // "01:20"
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
        
    return {
        expired: false,
        remainingTime: formattedTime,
    };
}

async function getOtpDetails(phone) {
    const otp = await redis.get(getOtpRedisPattern(phone));
    const remainingTime = await redis.ttl(getOtpRedisPattern(phone)); // Second
    
    return getExpiredRemainingOtp(otp , remainingTime)
}

async function getّforgetPassOtpDetails(phone) {
    const otp = await redis.get(getRefreshPasswordOtpRedisPattern(phone));
    const remainingTime = await redis.ttl(getRefreshPasswordOtpRedisPattern(phone)); // Second
    
    return getExpiredRemainingOtp(otp , remainingTime)
}


async function getRandomCode(length){
    const digist = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
        otp += digist[Math.random() * digist.length]; // "1" -> "19" -> "192" -> "195"
    }

    //! Temporary
    otp = "11111";

    const hashedOtp = await bcrypt.hash(otp, 12);

    return hashedOtp

}

const generateOtp = async (phone, length = 5, expireTime = 2) => {
    const hashedOtp = await getRandomCode(length);

    await redis.set(getOtpRedisPattern(phone), `${hashedOtp},1`, "EX", expireTime * 60);

    return hashedOtp;
};


const generateForgetPasswordOtp = async (phone, length = 5, expireTime = 2) => {
    const hashedOtp = await getRandomCode(length);

    await redis.set(getRefreshPasswordOtpRedisPattern(phone), `${hashedOtp},1`, "EX", expireTime * 60);

    return hashedOtp;
};

async function editOtpAttempts(phone) {
    const redisData  = await redis.get(getOtpRedisPattern(phone));
    let [otp , attempts] = redisData?.split(",") || []
    const remainingTime = await redis.ttl(getOtpRedisPattern(phone)); // Second

    await redis.set(getOtpRedisPattern(phone) , `${otp},${++attempts}` , "EX" , remainingTime);
}

async function editRefreshPasswordOtpAttempts(phone) {
    const redisData  = await redis.get(getRefreshPasswordOtpRedisPattern(phone));
    let [otp , attempts] = redisData?.split(",") || []
    const remainingTime = await redis.ttl(getRefreshPasswordOtpRedisPattern(phone)); // Second

    await redis.set(getOtpRedisPattern(phone) , `${otp},${++attempts}` , "EX" , remainingTime);
}

module.exports = {
    getOtpRedisPattern,
    getOtpDetails,
    generateOtp,
    getVerifiedPhonePattern,
    generateVerifiedPhone,
    getBannedPhonePattern,
    editOtpAttempts,
    getRefreshPasswordOtpRedisPattern,
    generateForgetPasswordOtp,
    editRefreshPasswordOtpAttempts,
    getّforgetPassOtpDetails
}