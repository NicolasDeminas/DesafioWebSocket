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

io.on("connection", async (socket) => {
  //console.log("Nueva conexion");

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
