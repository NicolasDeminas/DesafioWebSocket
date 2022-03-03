const express = require('express')
const {updateProduct, deleteProduct} = require('../controllers/productsController')

const {Router} = express

const router = new Router()


router.put("/updateProduct/:id", updateProduct);

  router.delete("/deleteProduct/:id", deleteProduct);

  module.exports = router