const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const passwordRequestSchema = new Schema({
  isActive: {
    type: Boolean,
    default: true,
  },
  date: { type: Date,
    default: Date.now },
  id: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('PasswordRequest', passwordRequestSchema);
