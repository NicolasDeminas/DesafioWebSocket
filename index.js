const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const http = require("http");
const server = http.createServer(app);
const knex = require("./db");
const Contenedor = require("./contenedor");
const Mensajes = require("./mensajes");

const io = require("socket.io")(server);

const c = new Contenedor();
const msn = new Mensajes();

app.use(express.static(__dirname + "/public"));
app.use(express.json());

io.on("connection", async (socket) => {
  //console.log("Nueva conexion");

  socket.emit("message_back", await msn.getAll());

  socket.on("data_msn", async (data) => {
    await msn.save(data);
    io.sockets.emit("message_back", await msn.getAll());
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

server.listen(port, () => {
  console.log(`Server run on port ${port}`);
});
