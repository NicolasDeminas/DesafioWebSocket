const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const http = require("http");
const server = http.createServer(app);
const Contenedor = require("./contenedor");

const { Server } = require("socket.io");
const Mensajes = require("./mensajes");
const io = new Server(server);

const c = new Contenedor();
const msn = new Mensajes();
app.use(express.static(__dirname + "/public"));

io.on("connection", async (socket) => {
  console.log("Nueva conexion");

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

server.listen(port, () => {
  console.log(`Server run on port ${port}`);
});
