const socket = io();
const normalize = normalizr;

socket.on("message_back", (data) => {
  render(data);
  socket.emit("message_from_client", "Soy el Front");
});

socket.on("infoProductos", (data) => {
  renderTable(data);
});

//Normalize
const authorSchema = new normalize.schema.Entity("author");

const messageSchema = new normalize.schema.Entity(
  "message",
  {
    author: authorSchema,
  },
  { idAttribute: "email" }
);

//Denormalize

const render = (data) => {
  //console.log(data);
  let html = data
    .map((x) => {
      //cambiar tipos y colores
      return `<p> <strong style="color: ">${x.author.alias}: </strong>  ${x.text} </p>`;
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
  console.log(dataobj);
  console.log(normalize.normalize(dataobj, messageSchema));
  //socket.emit("data_msn", dataobj);
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
