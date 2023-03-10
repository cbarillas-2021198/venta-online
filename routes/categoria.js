const { Router } = require('express');
const { check } = require('express-validator');
const { getCategoria, postCategoria, putCategoria, deleteCategoria } = require('../controllers/categorias');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { esAdminRole } = require('../middlewares/validar-roles');
const Categoria = require("../models/categoria");
const Producto = require("../models/producto");

const router = Router();

router.get('/mostrar', getCategoria)

router.post('/agregar',[
    validarJWT,
    esAdminRole,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    validarCampos
], postCategoria)

router.put('/editar/:id', putCategoria)

router.delete('/eliminar/:id', deleteCategoria)

router.get('/buscarCategoria', async (req, res) => {
    const nombreCategoria = req.query.nombreCategoria;
  
    try {
      const categoria = await Categoria.findOne({ nombre: nombreCategoria });
  
      if (!categoria) {
        return res.status(404).json({
          ok: false,
          msg: 'Categoría no encontrada'
        });
      }
  
      const productos = await Producto.find({ categoria: categoria._id });
  
      return res.status(200).json({
        ok: true,
        productos
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        msg: 'Error al buscar productos por categoría'
      });
    }
  });



module.exports = router;