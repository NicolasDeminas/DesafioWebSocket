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
  const knex = require("./db");
  const Contenedor = require("./contenedor");
  const Mensajes = require("./mensajes");
  const random = require("./routes/randoms");
  const { normalize, denormalize, schema } = require("normalizr");
  const util = require("util");
  const session = require("express-session");
  const mongoStore = require("connect-mongo");
  const passport = require("passport");
  const bcrypt = require("bcrypt");
  const LocalStrategy = require("passport-local").Strategy;
  const { userModel } = require("./db");
  const dotenv = require("dotenv");
  const { createHash } = require("crypto");
  const { infoLogger, warningLogger, errorLogger } = require("./logger");

  const PORT = process.env.PORT || 8080;

  const io = require("socket.io")(server);

  const c = new Contenedor();
  const msn = new Mensajes();

  function print(objeto) {
    console.log(util.inspect(objeto, false, 12, true));
  }

  dotenv.config();

  //Normalizr

  const authorSchema = new schema.Entity("author", {}, { idAttribute: "id" });

  const messageSchema = new schema.Entity(
    "text",
    { author: authorSchema },
    { idAttribute: "id" }
  );

  const messagesSchema = new schema.Entity(
    "posts",
    { text: [messageSchema] },
    { idAttribute: "id" }
  );

  function modifyData(data) {
    const newData = { id: "message", posts: data };
    return newData;
  }

  app.use(express.json());
  app.use(express.urlencoded());

  app.use(compression());

  app.use(
    session({
      store: mongoStore.create({
        mongoUrl: process.env.MONGO_CONNECT,
      }),
      secret: process.env.SESSION_SECRET,
      saveUninitialized: true,
      resave: true,
    })
  );

  app.use("/api/randoms", random);

  const authorize = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
      return;
    }
    res.redirect("/login");
  };

  app.use((req, res, next) => {
    let ruta = req.originalUrl;
    let metodo = req.method;

    infoLogger.info(`Ruta: ${ruta} \n Metodo: ${metodo}`);
    next();
  });

  const infolog = (req, res) => {
    let ruta = req.originalUrl;
    let metodo = req.method;

    infoLogger.trace(`Ruta: ${ruta} \n Metodo: ${metodo}`);
  };

  //PASSPORT
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    "local-login",
    new LocalStrategy((username, password, done) => {
      userModel.findOne({ username: username }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          console.log(`User not found`);
          return done(null, false);
        }
        if (!isValidPassword(user, password)) {
          console.log(`Invalid password`);
          return done(null, false);
        }
        return done(null, user);
      });
    })
  );

  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      (req, username, password, done) => {
        userModel.findOne({ username: username }, (err, user) => {
          if (err) {
            console.log(`Error in signup ${err}`);
          }
          if (user) {
            console.log(`User already exists`);
            return done(null, false);
          }
          const newUser = {
            username: username,
            password: bcrypt.hashSync(password, 10),
          };

          userModel.create(newUser, (err, user) => {
            if (err) {
              console.log(`Error in saving user: ${err}`);
              return done(err);
            }
            return done(null, user);
          });
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    userModel.findById(id, done);
  });

  function isValidPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
  }

  app.get("/", (req, res) => {
    res.redirect("/home");
  });

  io.on("connection", async (socket) => {
    const data = await msn.getAll();

    const normalizeMessage = normalize(modifyData(data), messagesSchema);
    const deNormalizeData = denormalize(
      normalizeMessage.result,
      messagesSchema,
      normalizeMessage.entities
    );

    socket.emit("message_back", normalizeMessage);

    socket.on("data_msn", async (data) => {
      let newData = denormalize(data.result, messagesSchema, data.entities);
      await msn.save(newData.posts);

      io.sockets.emit("message_back", normalizeMessage);
    });

    socket.emit("infoProductos", await c.getAll());

    socket.on("newProduct", async (data) => {
      await c.save(data);
      console.log(`data guardada`);
      io.sockets.emit("infoProductos", await c.getAll());
    });
  });

  app.get("/home", authorize, (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
  });

  app.get("/login", (req, res) => {
    res.sendFile(`${__dirname}/public/login.html`);
  });

  app.get("/signup", (req, res) => {
    res.sendFile(`${__dirname}/public/signup.html`);
  });

  app.get("/getUsers", (req, res) => {
    res.send(user);
  });

  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/login",
      failureRedirect: "/signup",
    })
  );

  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/home",
      failureRedirect: "/login",
    })
  );

  app.get("/logout", (req, res) => {
    try {
      req.logOut();
      res.redirect("/login");
    } catch (err) {
      errorLogger.error(err);
    }
  });

  app.put("/updateProduct/:id", async (req, res) => {
    try {
      await c.update(req.params.id, req.body);
      res.send(`Producto id=${req.params.id} actualizado con exito`);
    } catch (err) {
      errorLogger.error(err);
    }
  });

  app.delete("/deleteProduct/:id", async (req, res) => {
    try {
      await c.delete(req.params.id);
      res.send(`Producto id=${req.params.id} eliminado con exito`);
    } catch (err) {
      errorLogger.error(err);
    }
  });

  app.get("/api/productos-test", async (req, res) => {
    try {
      res.send(await c.getFakerProducts());
    } catch (err) {
      errorLogger.error(err);
    }
  });

  app.get("/info", (req, res) => {
    let data = {
      "argumentos de entrada": process.argv.slice(2),
      "sistema opertativo": process.platform,
      "version de node": process.version,
      rss: process.memoryUsage().rss,
      path: process.execPath,
      processId: process.pid,
      "carpeta proyecto": process.cwd(),
      procesadores: numCPUs,
    };
    res.json({ data });
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
