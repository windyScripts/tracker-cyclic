const Expenses = require('../models/expenses-model');

exports.findOne = function(params, values = null, sortParams = null) {
  return   Expenses.findOne(params, values, sortParams);
};

exports.findMany = function(findParams, sortParams = null, limit = null) {
  return   Expenses.find(findParams).sort(sortParams).limit(limit);
};

exports.count = function(params) {
  return Expenses.countDocuments(params);
};

exports.save = function(expense, session = null) {
  return   expense.save({ session });
};

exports.create = function(params, session = null) {
  const expense = new Expenses(params);
  return expense.save({ session });
};

exports.destroy = function(params, session = null) {
  return   Expenses.deleteOne(params, { session });
};
