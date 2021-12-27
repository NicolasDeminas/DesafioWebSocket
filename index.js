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

app.use(express.static(__dirname + "/public"));
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

let authorized;

function authorize(req, res, next) {
  if (req.session.user == "Nico") {
    authorized = true;
    next;
  }
  res.redirect("/login");
}

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

app.get("/login", (req, res) => {
  res.sendFile(`${__dirname}/public/login.html`);
});

app.post("/login", (req, res) => {
  const user = req.body;
  if (user.username == "Nico") {
    console.log(user.username);
    req.session.user = user.username;
    res.redirect("/");
    return;
  }
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

server.listen(port, () => {
  console.log(`Server run on port ${port}`);
});
