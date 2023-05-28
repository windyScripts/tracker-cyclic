const User = require('../models/user-model');

exports.findOne = function(params) {
  return   User.findOne(params);
};

exports.findAll = async function(params, sortParams = null) {
  return User.find(params).sort(sortParams);
};

exports.create = function(params) {
  const user = new User(params);
  return user.save();
};

exports.findById = function(_id) {
  return User.findById(_id).exec();
};

exports.save = function(user, session = null) {
  return user.save({ session });
};
