const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const http = require("http");
const server = http.createServer(app);
const knex = require("./db");
const Contenedor = require("./contenedor");
const Mensajes = require("./mensajes");
const { normalize, denormalize, schema } = require("normalizr");
const util = require("util");
const session = require("express-session");
const mongoStore = require("connect-mongo");
const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const { userModel } = require("./db");
const { createHash } = require("crypto");

const io = require("socket.io")(server);

const c = new Contenedor();
const msn = new Mensajes();

function print(objeto) {
  console.log(util.inspect(objeto, false, 12, true));
}

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

app.use(
  session({
    store: mongoStore.create({
      mongoUrl:
        "mongodb+srv://Nico:SnZtUcHWXy8KRj8Y@ecommerceatlas.zbptj.mongodb.net/coder_ecommerce?retryWrites=true&w=majority",
    }),
    secret: "misecreto",
    saveUninitialized: true,
    resave: true,
  })
);

const authorize = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  res.redirect("/login");
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
  req.logOut();
  res.redirect("/login");
});

app.put("/updateProduct/:id", async (req, res) => {
  await c.update(req.params.id, req.body);
  res.send(`Producto id=${req.params.id} actualizado con exito`);
});

app.delete("/deleteProduct/:id", async (req, res) => {
  await c.delete(req.params.id);
  res.send(`Producto id=${req.params.id} eliminado con exito`);
});

app.get("/api/productos-test", async (req, res) => {
  res.send(await c.getFakerProducts());
});

app.use(express.static(__dirname + "/public/"));

server.listen(port, () => {
  console.log(`Server run on port ${port}`);
});
