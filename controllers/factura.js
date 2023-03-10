const Usuario = require('../models/usuario');
const Orden = require('../models/orden');
const Producto = require('../models/producto');
const Factura = require('../models/factura');

async function generarFactura(idUsuario) {
  try {
    const usuario = await Usuario.findById(idUsuario);
    await usuario.populate('compras').execPopulate();
    const facturas = [];

    for (const factura of usuario.compras) {
      const orden = await Orden.findById(factura.orden).populate('productos.producto');
      const detallesProductos = [];
      let total = 0;

      for (const productoOrden of orden.productos) {
        const producto = productoOrden.producto;
        const cantidad = productoOrden.cantidad;
        detallesProductos.push({
          nombre: producto.nombre,
          cantidad: cantidad,
          precio: producto.precio,
          subtotal: cantidad * producto.precio
        });
        total += cantidad * producto.precio;
        producto.disponible -= cantidad;
        await producto.save();
      }
      const nuevaFactura = new Factura({
        usuario: idUsuario,
        orden: factura.orden,
        total: total,
        fecha: new Date()
      });


      await nuevaFactura.save();
      facturas.push({
        detallesProductos: detallesProductos,
        total: nuevaFactura.total,
        fecha: nuevaFactura.fecha
      });
    }

    console.log('Facturas generadas con éxito');
    console.log(facturas);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  generarFactura
}