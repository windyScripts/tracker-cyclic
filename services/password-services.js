const PasswordRequests = require('../models/password-requests-model');

exports.findOne = async function(params) {
  return   PasswordRequests.findOne(params);
};

exports.create = function(params) {
  return   PasswordRequests.create(params);
};

exports.update = function(password, params) {
  return   password.update(params);
};

exports.save = function(passwordRequest) {
  return passwordRequest.save();
};
