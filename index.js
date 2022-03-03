const express = require("express");
const compression = require("compression");
const app = express();
const parseArg = require("minimist");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

const options = {
  default: { port: 8080, mode: "fork" },
  alias: { p: "port", m: "mode" },
};

let arguments = parseArg(process.argv.slice(2), options);

const clusterMode = arguments.mode == "CLUSTER";

if (clusterMode && cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", () => {
    console.log(`Process ${process.pid} died`);
  });
} else {
  const http = require("http");
  const server = http.createServer(app);
  const knex = require("./src/config/db");
  const random = require("./src/routes/randoms");
  const session = require("express-session");
  const sessionConfig = require('./src/config/session')
  const dotenv = require("dotenv");
  const { infoLogger, warningLogger, errorLogger } = require("./src/utils/logger");

  const PORT = process.env.PORT || 8080;
  const io = require("socket.io")(server);

  dotenv.config();

  app.use(express.json());
  app.use(express.urlencoded());

  app.use(compression());

  const authorize = require('./src/utils/auth')

  app.use("/api/randoms", random);

  

  app.use((req, res, next) => {
    let ruta = req.originalUrl;
    let metodo = req.method;

    infoLogger.info(`Ruta: ${ruta} \n Metodo: ${metodo}`);
    next();
  });

  const login = require('./src/routes/login')
  const products = require('./src/routes/products')
  const info = require('./src/routes/info')
  const socket = require('./src/utils/socket')
  
  //PASSPORT

  app.use(session(sessionConfig))
  
  const passport = require('./src/config/passport')
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', login)
  app.use('/products', products)
  app.use('/api', info)

  io.on("connection", socket);

  app.get("/home", authorize, (req, res) => {
    res.sendFile(`${__dirname}/src/public/index.html`);
  });

  app.use(express.static(__dirname + "/public/"));

  app.use("*", (req, res) => {
    let ruta = req.originalUrl;
    let metodo = req.method;

    warningLogger.warn(`Ruta ${ruta} metodo ${metodo} no implementados`);
    res.send(`Ruta no implementada`);
  });

  server.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`);
  });
}
