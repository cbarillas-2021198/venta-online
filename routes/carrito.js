
const { Router } = require('express');
const { agregarAlCarrito, comprar, editarFactura} = require('../controllers/carrito');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();




router.post('/agregar',[
    validarJWT
] ,agregarAlCarrito);


router.post('/compra', [
    validarJWT
],comprar);



module.exports = router;