// const knex = require("./db");

// class Mensajes {
//   constructor() {
//     this.message = [];
//   }

//   async save(message) {
//     await knex("messages").insert(message);
//   }

//   async getAll() {
//     let data = [];
//     await knex
//       .select("nombre", "created_at", "mensaje")
//       .from("messages")
//       .then((res) => {
//         data = res;
//       });
//     //console.log(data);
//     return data;
//   }
// }

const { messageModel } = require("../config/db");

class Mensajes {
  constructor() {}
  async save(message) {
    await messageModel.create(message);
  }

  async getAll() {
    const messages = await messageModel.find();
    return messages;
  }

  async delete(id) {
    const message = await messageModel.deleteOne({
      _id: id,
    });
  }

  async deleteAll() {
    const message = await messageModel.deleteMany();
    return message;
  }
}

module.exports = Mensajes;
