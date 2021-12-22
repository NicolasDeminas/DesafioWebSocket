const socket = io();

//Normalize
const authorSchema = new normalizr.schema.Entity(
  "author",
  {},
  { idAttribute: "id" }
);

const messageSchema = new normalizr.schema.Entity(
  "text",
  {
    author: authorSchema,
  },
  { idAttribute: "id" }
);

const messagesSchema = new normalizr.schema.Entity(
  "posts",
  { mensaje: [messageSchema] },
  { idAttribute: "id" }
);

function modifyData(data) {
  const newData = { id: "message", posts: data };
  return newData;
}

socket.on("message_back", (data) => {
  const newData = normalizr.denormalize(
    data.result,
    messageSchema,
    data.entities
  );

  let html = data.entities.posts.message.posts
    .map((x) => {
      //cambiar tipos y colores
      return `<p> <strong style="color: ">${x.author.alias}: </strong>  ${x.text} </p>`;
    })
    .join(" ");

  document.querySelector("#mensajes").innerHTML = html;

  //socket.emit("message_from_client", "Soy el Front");
});

socket.on("infoProductos", (data) => {
  renderTable(data);
});

const render = (data) => {
  const newData = normalizr.denormalize(data, messageSchema, data.entities);

  console.log(newData);
  let html = newData
    .map((x) => {
      // console.log(x.length);
      console.log(x.undefined.author.alias);
      //cambiar tipos y colores
      // return `<p> <strong style="color: ">${x.author.alias}: </strong>  ${x.text} </p>`;
    })
    .join(" ");

  document.querySelector("#mensajes").innerHTML = html;
};

const addInfo = () => {
  let dataobj = {
    author: {
      id: document.querySelector("#email").value,
      nombre: document.querySelector("#name").value,
      apellido: document.querySelector("#apellido").value,
      edad: document.querySelector("#edad").value,
      alias: document.querySelector("#alias").value,
      avatar: document.querySelector("#avatar").value,
    },
    text: document.querySelector("#mensaje").value,
  };

  let data = modifyData(dataobj);
  socket.emit("data_msn", normalizr.normalize(data, messagesSchema));
  document.querySelector("#mensaje").value = "";
  return false;
};

const renderTable = (data) => {
  let table = data
    .map((x) => {
      return `
        <tr>
          <td>${x.nombre}</td>
          <td>${x.descripcion}</td>
          <td>${x.codigo}</td>
          <td>${x.precio}</td>
          <td>${x.stock}</td>
          <td>
            <img
              src="${x.foto}"
              alt="${x.foto}"
              class="img-thumbnail"
            />
          </td>
        </tr>`;
    })
    .join(" ");
  document.querySelector("#tablaProductos").innerHTML = table;
};

const addProduct = () => {
  let dataobj = {
    nombre: document.querySelector("#nombre").value,
    precio: document.querySelector("#precio").value,
    foto: document.querySelector("#foto").value,
    stock: document.querySelector("#stock").value,
    codigo: document.querySelector("#codigo").value,
    descripcion: document.querySelector("#descripcion").value,
  };
  console.log(dataobj);

  socket.emit("newProduct", dataobj);
  //document.querySelector("#mensaje").value = "";
  return false;
};
