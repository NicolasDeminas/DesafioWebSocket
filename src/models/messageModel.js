const {Schema, model} = require('mongoose')


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
  
  module.exports = messageModel