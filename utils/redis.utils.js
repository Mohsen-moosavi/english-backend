const redis = require("../redis");
const bcrypt = require("bcryptjs");

function getOtpRedisPattern(phone) {
    return `otp:${phone}`;
}

function getVerifiedPhonePattern(phone) {
    return `veified:${phone}`;
}

function getBannedPhonePattern(phone) {
    return `ban:${phone}`;
}

async function generateVerifiedPhone(phone){
    await redis.set(getVerifiedPhonePattern(phone), "0" + phone.slice(3), "EX", 10 * 60);
} 

async function getOtpDetails(phone) {
    const otp = await redis.get(getOtpRedisPattern(phone));
    if (!otp) {
        return {
            expired: true,
            remainingTime: 0,
        };
    }

    const remainingTime = await redis.ttl(getOtpRedisPattern(phone)); // Second
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60; // "01:20"
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

    return {
        expired: false,
        remainingTime: formattedTime,
    };
}

const generateOtp = async (phone, length = 5, expireTime = 2) => {
    const digist = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
        otp += digist[Math.random() * digist.length]; // "1" -> "19" -> "192" -> "195"
    }

    //! Temporary
    otp = "11111";

    const hashedOtp = await bcrypt.hash(otp, 12);

    await redis.set(getOtpRedisPattern(phone), `${hashedOtp},1`, "EX", expireTime * 60);

    return otp;
};

async function editOtpAttempts(phone) {
    const redisData  = await redis.get(getOtpRedisPattern(phone));
    let [otp , attempts] = redisData?.split(",") || []
    const remainingTime = await redis.ttl(getOtpRedisPattern(phone)); // Second

    await redis.set(getOtpRedisPattern(phone) , `${otp},${++attempts}` , "EX" , remainingTime);
}

module.exports = {
    getOtpRedisPattern,
    getOtpDetails,
    generateOtp,
    getVerifiedPhonePattern,
    generateVerifiedPhone,
    getBannedPhonePattern,
    editOtpAttempts
}