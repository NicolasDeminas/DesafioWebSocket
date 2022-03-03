const { knex } = require("../config/db");
const faker = require("faker");

let fakerArr = [];

class Contenedor {
  constructor() {
    this.product = [];
  }

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
