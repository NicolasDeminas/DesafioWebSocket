const authorSchema = require('../config/normalizr')
const Mensajes = require("../models/mensajes");
const Contenedor = require("../utils/contenedorFaker");

const c = new Contenedor();
const msn = new Mensajes();

module.exports =  async function (socket)  {
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
  }


