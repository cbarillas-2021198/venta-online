const { response, request } = require("express");
const Usuario = require("../models/usuario");
const Producto = require("../models/producto");
const Carrito = require("../models/carrito");
const Orden = require("../models/orden");
const Factura = require('../models/factura');

const agregarAlCarrito = async (req, res = response) => {
  const { productoId, cantidad } = req.body;
  const usuarioId = req.usuario._id;

  try {
    let carrito = await Carrito.findOne({ usuario: usuarioId });

    if (!carrito) {
      carrito = new Carrito({ usuario: usuarioId });
    }

    carrito.productos.push({ producto: productoId, cantidad: cantidad });
    await carrito.save();
    res.status(201).json({ msg: 'Producto agregado al carrito' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Error al agregar al carrito' });
  }
};



const comprar = async (req, res) => {
  const usuarioId = req.usuario._id;
  const carrito = await Carrito.findOne({ usuario: usuarioId }).populate('productos.producto');
  if (!carrito || carrito.productos.length === 0) {
    return res.status(400).json({ msg: 'El carrito está vacío' });
  }
  let total = 0;
  for (const item of carrito.productos) {
    total += item.producto.precio * item.cantidad;
  }
  const orden = new Orden({
    usuario: usuarioId,
    productos: carrito.productos,
    total,
  });
  const productosOrden = orden.productos.map(item => ({
    productoId: item.producto._id,
    cantidad: item.cantidad,
  }));
  for (const producto of productosOrden) {
    await Producto.findByIdAndUpdate(producto.productoId, { $inc: { disponible: -producto.cantidad } });
  }
  await orden.save();
  carrito.productos = [];
  await carrito.save();


  res.json({ msg: 'Compra realizada', orden });
};


const buscarFacturaPorId = async (facturaId) => {
  try {
    const factura = await Factura.findById(facturaId);
    if (!factura) {
      throw new Error('Factura no encontrada');
    }
    return factura;
  } catch (error) {
    throw new Error(`Error al buscar la factura: ${error.message}`);
  }
};

module.exports = {
  agregarAlCarrito,
  comprar,
  buscarFacturaPorId
}
