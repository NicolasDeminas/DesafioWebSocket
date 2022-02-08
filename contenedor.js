const { knex } = require("./db");
const faker = require("faker");

let fakerArr = [];

class Contenedor {
  constructor() {
    this.product = [];
  }

  // async save(product) {
  //   await knex("products").insert(product);
  // }

  // async getById(id) {
  //   let data = [];
  //   await knex
  //     .from("products")
  //     .where({ id: id })
  //     .then((res) => {
  //       data = res;
  //     });
  //   return data;
  // }

  // async getAll() {
  //   let data = [];
  //   await knex
  //     .select("nombre", "descripcion", "codigo", "foto", "precio", "stock")
  //     .from("products")
  //     .then((res) => {
  //       data = res;
  //     });
  //   return data;
  // }

  // async update(id, obj) {
  //   console.log(obj);
  //   knex
  //     .from("products")
  //     .where({ id: id })
  //     .update({
  //       nombre: obj.nombre,
  //       descripcion: obj.descripcion,
  //       codigo: obj.codigo,
  //       foto: obj.foto,
  //       precio: obj.precio,
  //       stock: obj.stock,
  //     })
  //     .then((res) => {
  //       console.log(res);
  //     });
  // }

  // async delete(id) {
  //   knex("products")
  //     .where({ id: id })
  //     .del()
  //     .then((res) => {
  //       console.log(res);
  //     });
  // }

  async getFakerProducts() {
    for (let i = 0; i < 5; i++) {
      fakerArr.push({
        id: i + 1,
        created_at: faker.datatype.datetime(),
        nombre: faker.commerce.productName(),
        descripcion: faker.commerce.productDescription(),
        codigo: faker.datatype.number(),
        foto: faker.image.business(),
        precio: faker.commerce.price(),
        stock: faker.datatype.number(),
      });
    }
    return fakerArr;
  }
}

module.exports = Contenedor;
