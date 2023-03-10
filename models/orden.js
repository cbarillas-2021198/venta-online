const { Schema, model } = require('mongoose');

const ordenSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    productos: [
      {
        producto: {
          type: Schema.Types.ObjectId,
          ref: 'Producto',
          required: true
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],
    total: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Orden = model('Orden', ordenSchema);

module.exports = Orden;