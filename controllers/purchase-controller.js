const jwt = require('jsonwebtoken');

const Order = require('../services/order-services');
const User = require('../models/user-model')
const rzp = require('../services/Rzp-services');

function generateAccessToken(id) {
  const iat = new Date;
  return jwt.sign({ userId: id, date: iat.getTime() }, '12345');
}

exports.premium = async (req, res) => {
  try {
    const amount = 2500;
    const response = await rzp.createOrder(amount, req.user);
    return res.status(201).json(response);
  } catch (err) {
    console.log(err);
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id, payment_status } = req.body;
    const order = await Order.findOne({ orderid: order_id });
    if (payment_status === 'SUCCESS') {
      order.paymentid = payment_id;
      order.status = 'SUCCESS';
      req.user.ispremiumuser = true;
      const p1 = Order.save(order);
      const p2 = User.save(req.user);
      await Promise.all([p1, p2]);
      const token = generateAccessToken(req.user.id);
      return res.status(202).json({ success: true, message: 'Transaction Successful', token });
    } else if (payment_status === 'FAILURE') {
      order.paymentid = payment_id;
      order.status = 'FAILED';
      await Order.save(order);
      return res.status(403).json({ success: false, message: 'Transaction Failed' });
    }
  } catch (err) {
    console.log(err);
  }
};
