//Importaciones
const { Router } = require('express');
const { check } = require('express-validator');
const { getUsuarios, getUsuariosPorId, registroUsuario, eliminarUsuarioPorId, obtenerCompras, putUsuario,deleteUsuario} = require('../controllers/usuario');
const { esRoleValido, emailExiste,  } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole, esAdminRole,  } = require('../middlewares/validar-roles');
const Usuario = require('../models/usuario');



const router = Router();

router.post('/registro', [

    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe de ser más de 6 digitos').isLength({ min: 6 }),
    check('correo', 'El correo no es valido').isEmail(),
    check('correo').custom(emailExiste),
    validarCampos,
], registroUsuario);


router.get('/mostrar', getUsuarios);

router.get('/mostrarCompras', [
    validarJWT
],obtenerCompras);


router.get('/:id', validarJWT, esAdminRole, getUsuariosPorId);


router.put('/editar/:id', validarJWT, esAdminRole, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await getUsuariosPorId(id);

        if (usuario.rol === 'ADMIN_ROLE') {
            return res.status(401).json({
                msg: 'No tiene permisos suficientes para realizar esta operación'
            });
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
});

router.delete('/eliminar/:id', validarJWT, esAdminRole, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findById(id);

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        if (usuario.rol === 'ADMIN_ROLE') {
            return res.status(401).json({
                msg: 'No tiene permisos suficientes para eliminar a este usuario'
            });
        }

        const usuarioEliminado = await eliminarUsuarioPorId(id);

        res.json({
            msg: 'Usuario eliminado exitosamente',
            usuario: usuarioEliminado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});


router.put('/editarUsuario/:id',[
    check('id', 'No es un ID valido').isMongoId(),
    check('correo', 'El correo no es valido').isEmail(),
    check('correo').custom(emailExiste),
    check('password', 'la password es obligatoria para el post').not().isEmpty(),
    check('password', 'La passward debe ser mayor a 6 letras').isLength({ min: 6 }),
    validarCampos
], putUsuario);


router.delete('/eliminarUsuario/:id', [
    validarJWT,
    check('id', 'No es un ID valido').isMongoId(),
    validarCampos
], deleteUsuario);

module.exports = router;

