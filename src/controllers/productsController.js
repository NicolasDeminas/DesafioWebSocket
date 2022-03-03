
  const Contenedor = require("../utils/contenedorFaker");



  const c = new Contenedor();



  

const updateProduct = async (req, res) => {
    try {
      await c.update(req.params.id, req.body);
      res.send(`Producto id=${req.params.id} actualizado con exito`);
    } catch (err) {
      errorLogger.error(err);
    }
  }


const deleteProduct = async (req, res) => {
    try {
      await c.delete(req.params.id);
      res.send(`Producto id=${req.params.id} eliminado con exito`);
    } catch (err) {
      errorLogger.error(err);
    }
  }


  module.exports = {
      updateProduct, deleteProduct
  }