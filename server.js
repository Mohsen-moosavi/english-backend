const { db, Role, Level } = require("./db");
const app = require("./app");
const configs = require("./configs");
const dotenv = require("dotenv")
const redis = require("./redis");
const { where } = require("sequelize");

async function startServer() {

  try {

    if(!configs.isProduction){
        dotenv.config()
    }

    await db.authenticate();
    await redis.ping();

    // for (const role in configs.roles) {
    //   Role.findOrCreate({where : {name : configs.roles[role]}})
    // }

    // for (const level in configs.levels) {
    //   await Level.findOrCreate({where : {name : configs.levels[level]}})
    // }

    app.listen(configs.port, () => {
      console.log(`Listening on port ${configs.port}`);
    });
  } catch (err) {
    console.log("Error ->", err);

    await db.close();
    await redis.disconnect();
  }
}

startServer();
