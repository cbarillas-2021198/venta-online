const { Schema, model } = require('mongoose');

const facturaSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    orden: {
      type: Schema.Types.ObjectId,
      ref: 'Orden',
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Factura = model('Factura', facturaSchema);

module.exports = Factura;