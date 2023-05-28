const mongoose = require('mongoose');

const Expenses = require('../services/expense-services');
const User = require('../services/user-services');

exports.getPageOfExpenses = async (req, res) => {
  try {
    const relativePagePosition = req.query.relativePagePosition;
    const numberOfExpenses = await Expenses.count({ userId: req.user.id });

    const expensesPerPage = parseInt(req.query.items);

    const numberOfPages = Math.ceil(numberOfExpenses / expensesPerPage);
    const targetId = req.query.id;
    const target = await Expenses.findOne({ _id: targetId });
    const targetDate = target.date;

    let order;
    let dateParams;

    if (relativePagePosition === 'expensesBack') {
      order = { date: -1 }; // DESC
      dateParams = {
        $lt: targetDate,
      };
    } else if (relativePagePosition === 'expensesForward') {
      order = { date: -1 }; //ASC
      dateParams = {
        $gt: targetDate,
      };
    } else {
      return res.status(400).json({ message: 'invalid request' });
    }

    const currentPageExpenses = await Expenses.findMany(
      {
        userId: req.user.id,
        date: dateParams,
      },
      order,
      expensesPerPage,
      targetDate,
    );
    res.status(200).json({
      currentPageExpenses,
      numberOfPages,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getButtonsAndLastPage = async (req, res) => {
  try {
    const promiseOne = Expenses.count({ userId: req.user.id });

    const expensesPerPage = parseInt(req.query.items);

    const promiseTwo = Expenses.findMany({
      userId: req.user.id,
    }, { date: -1 }, expensesPerPage);

    const promiseThree = User.findById(req.user.id);

    const [numberOfExpenses, currentPageExpensesReversed, user] = await Promise.all([promiseOne, promiseTwo, promiseThree]);

    const premiumStatus = user.isPremiumUser;

    const numberOfPages = Math.ceil(numberOfExpenses / expensesPerPage);

    const currentPageExpenses = currentPageExpensesReversed;
    res.status(200).json({
      premiumStatus,
      currentPageExpenses,
      numberOfPages,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.addOrUpdateExpense = async (req, res) => {
  if (req.body._id) {
    patchExpense(req, res);
  } else {
    addExpense(req, res);
  }
};

async function addExpense(req, res) {
  if (req.body.name.length === 0 || !Number(req.body.price)) {
    res.status(400).json({ message: 'invalid data' });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const expenseCreationPromise = Expenses.create({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      userId: req.user._id,
    }, session);
    const updatedExpense = Number(req.user.totalExpense) + Number(req.body.price);
    req.user.totalExpense = updatedExpense;
    const userSavePromise = User.save(req.user, session);
    const message = await Promise.all([expenseCreationPromise, userSavePromise]);
    console.log(message);
    await session.commitTransaction();
    await session.endSession();
    res.status(200).json(message);
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    await session.endSession();
  }
}

exports.deleteExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = req.params.eId;
    const expense = await Expenses.findOne({ _id, userId: req.user.id });
    const updatedExpense = Number(req.user.totalExpense) - Number(expense.price);
    req.user.totalExpense = updatedExpense;
    const userSavePromise = User.save(req.user, session);
    const expenseDeletionPromise = Expenses.destroy({  _id, userId: req.user.id }, session);
    const message = await Promise.all([userSavePromise, expenseDeletionPromise]);
    await session.commitTransaction();
    await session.endSession();
    res.status(200).json(message);
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    await session.endSession();
  }
};

async function patchExpense(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  if (req.body.name.length === 0 || !Number(req.body.price)) {
    res.status(400).json({ message: 'invalid data' });
  }
  try {
    const _id = req.body._id;
    const expense = await Expenses.findOne({ _id, userId: req.user.id });
    const updatedExpense = Number(req.user.totalExpense) - Number(expense.price) + Number(req.body.price);
    req.user.totalExpense = updatedExpense;
    const userSavePromise = User.save(req.user, session);
    expense.category = req.body.category;
    expense.price = parseInt(req.body.price);
    expense.name = req.body.name;
    console.log(expense);
    const expenseChangePromise = Expenses.save(expense, session);
    const message = await Promise.all([expenseChangePromise, userSavePromise]);
    await session.commitTransaction();
    await session.endSession();
    res.status(200).json(message);
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    await session.endSession();
  }
}

exports.showLeaderboards = async (req, res) => {
  try {
    const userLeaderBoard = await User.findAll(
      {}, { totalExpense: 1 });

    res.status(200).json(userLeaderBoard);
  } catch (err) {
    console.log(err);
  }
};

exports.getOldestAndNewestExpenseDates = async function(req, res) {
  try {
    const p1 = Expenses.findOne({

      userId: req.user.id,

    }, 'date', { sort: { date: 1 }});
    const p2 = Expenses.findOne({

      userId: req.user.id,

    }, 'date', { sort: { date: -1 }});
    const [beforeDate, afterDate] = await Promise.all([p1, p2]);
    return res.status(200).json({ beforeDate, afterDate });
  } catch (err) {
    console.log(err);
  }
};
