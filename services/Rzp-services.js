const Razorpay = require('razorpay');

const Order = require('../models/purchases-model');

exports.createOrder = function(amount, user) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return { message: 'Login failed' };
  }
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    return new Promise(resolve => {
      rzp.orders.create({ amount, currency: 'INR' }, async (err, order) => {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        Order.create({ orderid: order.id, status: 'PENDING', userId: user._id }).then(() => {
          resolve({ order, key_id: rzp.key_id });
        /* user.createOrder({ orderid: order.id, status: 'PENDING' }).then(() => {
          resolve({ order, key_id: rzp.key_id }); */
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
};

