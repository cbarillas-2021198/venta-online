const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const Orden = require('../models/orden');

const registroUsuario = async (req = request, res = response) => {

    const { nombre, correo, password, rol } = req.body;
    const registerUser = new Usuario({ nombre, correo, password, rol });
    const salt = bcrypt.genSaltSync();
    registerUser.password = bcrypt.hashSync(password, salt);

    await registerUser.save();

    res.status(201).json({
        msg: 'Se registro correctamente',
        registerUser
    });
}

const getUsuarios = async (req = request, res = response) => {

    //condiciones del get
    const query = { estado: true };

    const listaUsuarios = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query).populate("compras",)
    ]);

    res.json({
        msg: 'get Api - Controlador Usuario',
        listaUsuarios
    });

}

const getUsuariosPorId = async (id) => {
    const userById = await Usuario.findById(id)


    return userById;
}
const editarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        if (usuario.rol === 'ADMIN_ROLE') {
            return res.status(400).json({ msg: 'No se puede editar a otro administrador' });
        }

        usuario.nombre = req.body.nombre || usuario.nombre;
        usuario.email = req.body.email || usuario.email;
        usuario.rol = req.body.rol || usuario.rol;

        const usuarioActualizado = await usuario.save();

        res.json({
            msg: 'Usuario editado exitosamente',
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};


const eliminarUsuarioPorId = async (id) => {
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);
    return usuarioEliminado;
}


const obtenerCompras= async (req, res) => {
    const usuarioId = req.usuario._id;
  
    try {
    
      const ordenes = await Orden.find({ usuario: usuarioId });
  
      res.json({ ordenes });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Error al buscar órdenes de compra' });
    }
  };


  const putUsuario = async (req = request, res = response) => {

    const { id } = req.params;
    const { _id, rol, estado, google, ...resto } = req.body;
    const salt = bcrypt.genSaltSync();
    resto.password = bcrypt.hashSync(resto.password, salt);
    const usuarioEditado = await Usuario.findByIdAndUpdate(id, resto);

    res.json({
        msg: 'Se edito correctamente',
        usuarioEditado
    });

}


const deleteUsuario = async (req = request, res = response) => {

    const { id } = req.params;
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);

    res.json({
        msg: 'DELETE API de usuario',
        usuarioEliminado
    });

}




module.exports = {
    getUsuarios,
    editarUsuario,
    eliminarUsuarioPorId,
    getUsuariosPorId,
    registroUsuario,
    obtenerCompras,
    putUsuario,
    deleteUsuario

}


// CONTROLADOR