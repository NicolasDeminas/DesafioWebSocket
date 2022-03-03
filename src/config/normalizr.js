const { normalize, denormalize, schema } = require("normalizr");

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

  module.exports = authorSchema