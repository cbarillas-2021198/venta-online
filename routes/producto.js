const { Router } = require('express');
const { check } = require('express-validator');
const { postProducto, putProducto, deleteProducto, getProductos, obtenerProductosAgotados, obtenerProductosMasVendidos, buscarPorNombre } = require('../controllers/producto');
const { existeProductoPorId } = require('../helpers/db-validators');
const Producto = require('../models/producto');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole, esAdminRole } = require('../middlewares/validar-roles');

const router = Router();

router.get('/mostrar', getProductos);

router.get('/productosMasvendidos',obtenerProductosMasVendidos );

router.get('/agotados', obtenerProductosAgotados);

router.post('/agregarProducto', [
    validarJWT,
    esAdminRole,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
],postProducto);


router.put('/editar/:id', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio.').not().isEmpty(),
    check('id').custom( existeProductoPorId ),
    validarCampos
], putProducto)


router.delete('/eliminar/:id',[
    validarJWT, 
    esAdminRole,
    check('id', 'No es un id valido.').isMongoId(),
    check('id').custom( existeProductoPorId ),
    validarCampos
],

deleteProducto)

router.get('/buscarNombre', async (req, res) => {
    const nombre = req.query.nombre;
  
    try {
      const producto = await Producto.findOne({ nombre });
  
      if (!producto) {
        return res.status(404).json({
          ok: false,
          msg: 'Producto no encontrado'
        });
      }
  
      return res.status(200).json({
        ok: true,
        producto
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        msg: 'Error al buscar producto'
      });
    }
  });

module.exports = router;