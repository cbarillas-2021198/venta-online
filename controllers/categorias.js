const { response, request } = require('express');
const Categoria = require('../models/categoria');
const Producto = require('../models/producto');


const getCategoria = async (req = request, res = response) => {

    const query = { estado: true }
    const listaCategorias = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query).populate('usuario', 'nombre')
    ]);

    res.json({
        msg: 'get Api - Controlador Categoria',
        listaCategorias
    })
}

const getCategoriaPorID = async (req = request, res = response) => {

    const { id } = req.params;
    const categoriaById = await Categoria.findById(id).populate('usuario', 'nombre');
    res.status(201).json(categoriaById);
}

const postCategoria = async (req = request, res = response) => {
    const nombre = req.body.nombre.toUpperCase();
    const descripcion = req.body.descripcion.toUpperCase();
    const categoriaDB = await Categoria.findOne({ nombre })
    if (categoriaDB) {
        return res.status(400).json({
            msg: `La categoria ${categoriaDB.nombre}, ya existe.`
        });
    }
    const data = {
        nombre,
        descripcion,
        usuario: req.usuario._id
    }

    const categoria = new Categoria(data);
    await categoria.save()
    res.status(201).json(categoria);
}
const putCategoria = async (req = request, res = response) => {
    const { id } = req.params;
    const { estado, usuario, ...resto } = req.body;
    resto.nombre = resto.nombre.toUpperCase();
    const categoria = await Categoria.findByIdAndUpdate(id, resto, { new: true });
    res.status(201).json(categoria);
};

const deleteCategoria = async (req = request, res = response) => {
    const { id } = req.params;
    const categoriaEliminada = await Categoria.findOneAndDelete({ _id: id });
    const productos = await Producto.find({ categoria: id });
    const nuevaCategoria = await Categoria.findById('640b0df4963fd4ca7b21e9fe'); 
    for (const producto of productos) {
        producto.categoria = nuevaCategoria._id;
        await producto.save();
    }
    res.json({
        msg: 'Se elimino correctamente',
        categoriaEliminada
    })
}
module.exports = {
    getCategoria,
    postCategoria,
    putCategoria,
    deleteCategoria
}