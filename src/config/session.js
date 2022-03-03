const mongoStore = require("connect-mongo");
  const dotenv = require("dotenv");

  dotenv.config()



const sessionConfig = {
    store: mongoStore.create({
      mongoUrl: process.env.MONGO_CONNECT,
    }),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
  }

  module.exports = sessionConfig