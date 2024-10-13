const configs = require("./configs");

module.exports = {
    development: {
      username: configs.db.user,
      password: configs.db.password,
      database: configs.db.database,
      host: configs.db.host,
      dialect: configs.db.dialect,
      port : configs.db.port
    },
    test: {
      username: configs.db.user,
      password: configs.db.password,
      database: configs.db.database,
      host: configs.db.host,
      dialect: configs.db.dialect,
      port : configs.db.port
    },
    production: {
      username: configs.db.user,
      password: configs.db.password,
      database: configs.db.database,
      host: configs.db.host,
      dialect: configs.db.dialect,
      port : configs.db.port
    }
  }
  