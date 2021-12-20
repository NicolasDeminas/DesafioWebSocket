const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    database: "ecommerce",
  },
  pool: { min: 2, max: 8 },
});

//Id, Nombre, Descripcion, codigo, foto, precio, stock, timestamp, id
knex.schema
  .createTableIfNotExists("products", (table) => {
    table.increments("id").primary(),
      table.timestamp("created_at").defaultTo(knex.fn.now()),
      table.string("nombre"),
      table.string("descripcion"),
      table.string("codigo"),
      table.string("foto"),
      table.float("precio"),
      table.integer("stock");
  })
  .then(() => {
    console.log("Tabla creada con exito");
  })
  .catch((err) => {
    console.log(err);
  });

knex.schema
  .createTableIfNotExists("messages", (table) => {
    table.increments("id").primary(),
      table.timestamp("created_at").defaultTo(knex.fn.now()),
      table.string("nombre"),
      table.string("mensaje");
  })
  .then(() => {
    console.log("Tabla creada con exito");
  })
  .catch((err) => {
    console.log(err);
  });

const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/coder");

mongoose.connection.on("open", () => {
  console.log("Base de datos conectada con exito");
});

mongoose.connection.on("error", () => {
  console.log("Error al conectarse a la base de datos");
});

const messageSchema = new Schema({
  author: {
    id: String,
    nombre: String,
    apellido: String,
    edad: Number,
    alias: String,
    avatar: String,
  },

  text: { type: String, required: true },
});

const messageModel = model("message", messageSchema);

module.exports = { knex, messageModel };
