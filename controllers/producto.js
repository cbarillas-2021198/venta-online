const { request, response } = require('express');
const Producto = require('../models/producto')
const Orden = require("../models/orden");



const getProductos = async (req = request, res = response) => {
    // Condiciones del get
    const query = { estado: true };

    const listaProducto = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query)
            .select('nombre descripcion disponible precio categoria')
            .populate('categoria', 'nombre')
    ]);

    res.json({
        msg: 'get Api - Controlador Usuario',
        listaProducto
    });
}



const getProductoPorID = async (req = request, res = response) => {

    const { id } = req.params;
    const productoById = await Producto.findById(id)
        .populate('usuario', 'correo')
        .populate('categoria', 'nombre')


    res.status(201).json(productoById);

}

const postProducto = async (req = request, res = response) => {

    const { estado, usuario, ...body } = req.body;

    const productoDB = await Producto.findOne({ nombre: body.nombre });

   
    if ( productoDB ) {
        return res.status(400).json({
            msg: `El producto ${ productoDB.nombre }, ya existe en la DB`
        });
    }

  
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }

    const producto = await Producto( data );
    await producto.save();

    res.status(201).json( producto );
   
}

const putProducto = async (req = request, res = response) => {
    const { id } = req.params;

    const { estado, usuario, ...restoData } = req.body;

    if (restoData.nombre) {
        restoData.nombre = restoData.nombre.toUpperCase();
        restoData.usuario = req.usuario._id;
    }

    const productoActualizado = await Producto.findByIdAndUpdate(id, restoData, ({ new: true }));

    res.status(201).json({
        msg: 'Put Controller Producto',
        productoActualizado
    });
}

const deleteProducto = async (req = request, res = response) => {
    try {
      const { id } = req.params;
      const productoEliminado = await Producto.findByIdAndDelete(id);
      if (!productoEliminado) {
        return res.status(404).json({ msg: 'Producto no encontrado' });
      }
      res.json({
        msg: 'Producto eliminado',
        productoEliminado
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error del servidor' });
    }
  }


  const obtenerProductosMasVendidos = async (req, res) => {
    try {
      const productosMasVendidos = await Orden.aggregate([
        { $unwind: '$productos' },
        {
          $group: {
            _id: '$productos.producto',
            totalVendido: { $sum: '$productos.cantidad' },
          },
        },
        { $sort: { totalVendido: -1 } },
        {
          $lookup: {
            from: 'productos',
            localField: '_id',
            foreignField: '_id',
            as: 'producto',
          },
        },
        { $unwind: '$producto' },
        { $project: { _id: 0, producto: '$producto.nombre', totalVendido: 1 } },
      ]);
  
      res.json(productosMasVendidos);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Error al obtener los productos más vendidos' });
    }
  };

  const obtenerProductosAgotados = async (req, res) => {
    try {
      const productosAgotados = await Producto.find({ disponible: 0 });
      res.json(productosAgotados);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Error al obtener los productos agotados' });
    }
  };



module.exports = {
    getProductos,
    getProductoPorID,
    obtenerProductosAgotados,
    postProducto,
    putProducto,
    deleteProducto,
    obtenerProductosMasVendidos,
    
    
}