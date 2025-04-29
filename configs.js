module.exports = {
    db: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: process.env.DB_DIALECT,
      poolSize: process.env.DB_POOL_SIZE || 30,
    },
  
    port: parseInt(process.env.PORT) || 4000,
  
    auth: {
      accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
      refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
      accessTokenExpiresInSeconds: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refreshTokenExpiresInSeconds: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  
      google: {},
    },
  
    redis: {
      uri: process.env.REDIS_URI,
    },
  
    domain: process.env.DOMAIN,

    originDomain : {
      frontUserDomain : process.env.FRONT_USER_DOMAIN,
      frontAdminDomain : process.env.FRONT_ADMIN_DOMAIN,
    },
  
    isProduction: process.env.NODE_ENV === "production",

    roles : {
      manager : 'MANAGER',
      admin : 'ADMIN',
      user : 'USER',
      teacher : 'TEACHER',
      writter : 'WRITTER',
      teacherWritter : 'TEACHERWRITTER',
    },

    levels : {
      A1 : 'A1',
      A2 : 'A2',
      B1 : 'B1',
      B2 : 'B2',
      C1 : 'C1',
      C2 : 'C2',
    }
  };
  