const { Schema, model } = require('mongoose');

const ProductoSchema = Schema({
    nombre: {
        type: String,
        required: [true , 'El nombre de la cateogira es obligatorio'],
        unique: true
    },
    
    descripcion: { type: String },

    disponible: { type: Number, default: true },

    precio: {
        type: Number,
        default: 0
    },

    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    },

    ventas: {
        type: Number,
        default: 0
    },
   
    estado: {
        type: Boolean,
        default: true,
        required: true
    },
    
});

module.exports = model('Producto', ProductoSchema);