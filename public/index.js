const socket = io();

socket.on("message_back", (data) => {
  render(data);
  socket.emit("message_from_client", "Soy el Front");
});

socket.on("infoProductos", (data) => {
  renderTable(data);
});

const render = (data) => {
  let html = data
    .map((x) => {
      //cambiar tipos y colores
      return `<p> <strong style="color: ">${x.nombre}: </strong>[${x.created_at}]  ${x.mensaje} </p>`;
    })
    .join(" ");

  document.querySelector("#mensajes").innerHTML = html;
};

const addInfo = () => {
  let dataobj = {
    nombre: document.querySelector("#name").value,
    mensaje: document.querySelector("#mensaje").value,
  };
  console.log(dataobj);
  socket.emit("data_msn", dataobj);
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
