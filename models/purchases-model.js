const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ordersSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  paymentId: String,
  orderId: String,
  status: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Order', ordersSchema);

