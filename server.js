const { db } = require("./db");
const app = require("./app");
const configs = require("./configs");
const dotenv = require("dotenv")
const redis = require("./redis")

async function startServer() {

  try {

    if(!configs.isProduction){
        dotenv.config()
    }

    await db.authenticate();
    await redis.ping();

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
