const knex = require("./db");

class Contenedor {
  constructor() {
    this.product = [];
  }

  async save(product) {
    await knex("products").insert(product);
  }

  async getById(id) {
    let data = [];
    await knex
      .from("products")
      .where({ id: id })
      .then((res) => {
        data = res;
      });
    return data;
  }

  async getAll() {
    let data = [];
    await knex
      .select("nombre", "descripcion", "codigo", "foto", "precio", "stock")
      .from("products")
      .then((res) => {
        data = res;
      });
    return data;
  }
}

module.exports = Contenedor;
