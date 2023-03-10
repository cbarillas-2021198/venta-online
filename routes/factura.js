const { Router } = require('express');
const Orden = require('../models/orden');
const { generarFactura } = require('../controllers/factura');
const Factura = require('../models/factura');
const Producto = require('../models/producto');

const router = Router();


router.get('/generar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('ID de usuario:', id);
    const facturas = await Factura.find({ usuario: id })
      .populate({
        path: 'orden',
        populate: {
          path: 'productos.producto',
          select: 'nombre precio productos.cantidad  total fecha '
        },

      });
    console.log('Resultado de la consulta:', facturas);

    if (!facturas) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron facturas para este usuario'
      });
    }

    return res.status(200).json({
      ok: true,
      facturas
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al generar factura'
    });
  }
});


router.post('/crear/:idOrden', async (req, res) => {
  try {
    const { idOrden } = req.params;
    const orden = await Orden.findById(idOrden);

    if (!orden) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontró una orden con ese ID'
      });
    }


    const factura = new Factura({
      usuario: orden.usuario,
      orden: orden._id,
      productos: orden.productos,
      total: orden.total
    });

    await factura.save();
    return res.status(200).json({
      ok: true,
      factura
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al generar la factura'
    });
  }
});

router.post('/agregar', async (req, res) => {
  try {
    const { usuario, orden, total } = req.body;
    const nuevaFactura = new Factura({
      usuario,
      orden,
      total
    });

    await nuevaFactura.save();
    const { productos } = await Orden.findById(orden).populate('productos.producto');
    for (const producto of productos) {
      const cantidadVendida = producto.cantidad;
      const idProducto = producto.producto._id;

      await Producto.findByIdAndUpdate(idProducto, {
        $inc: { ventas: cantidadVendida, disponible: -cantidadVendida }
      });
    }

    return res.status(201).json({
      ok: true,
      factura: nuevaFactura
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al crear factura'
    });
  }
});

router.put('/editar/:id', async (req, res) => {
  const { id } = req.params;
  const { productos } = req.body;

  try {
    const factura = await Factura.findById(id);
    if (!factura) {
      return res.status(404).json({
        ok: false,
        msg: 'Factura no encontrada'
      });
    }

    for (const productoFactura of productos) {
      const producto = await Producto.findById(productoFactura.producto);
      if (!producto || productoFactura.cantidad > producto.disponible) {
        return res.status(400).json({
          ok: false,
          msg: `La cantidad de ${producto.nombre} en la factura supera la cantidad disponible en el inventario`
        })
      }
    }

    factura.productos = productos;
    await factura.save();

    return res.status(200).json({
      ok: true,
      factura
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al actualizar factura'
    });
  }
});
module.exports = router;