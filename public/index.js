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
      return `<p> <strong style="color: ">${x.nombre}: </strong>[${x.fecha}]  ${x.mensaje} </p>`;
    })
    .join(" ");

  document.querySelector("#mensajes").innerHTML = html;
};

const addInfo = () => {
  let dataobj = {
    nombre: document.querySelector("#nombre").value,
    //fecha: now,
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
          <td>${x.title}</td>
          <td>${x.price}</td>
          <td>
            <img
              src="${x.Thumbnail}"
              alt="${x.Thumbnail}"
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
    title: document.querySelector("#title").value,
    price: document.querySelector("#price").value,
    Thumbnail: document.querySelector("#thumbnail").value,
  };

  socket.emit("newProduct", dataobj);
  document.querySelector("#mensaje").value = "";
  return false;
};
