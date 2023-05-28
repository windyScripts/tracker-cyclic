const express = require('express');

const router = express.Router();

const downloadsController = require('../controllers/downloads-controller');
const expensesController = require('../controllers/expenses-controller');
const auth = require('../middleware/auth');

router.get('/entries', auth.authorization, expensesController.getButtonsAndLastPage);
router.post('/entry', auth.authorization, expensesController.addOrUpdateExpense);
router.delete('/entry/:eId', auth.authorization, expensesController.deleteExpense);
router.get('/download', auth.authorization, downloadsController.getPDFLink);
router.get('/entries/:pageNumber', auth.authorization, expensesController.getPageOfExpenses);
router.get('/leaderboard', auth.authorization, expensesController.showLeaderboards);
router.get('/dates', auth.authorization, expensesController.getOldestAndNewestExpenseDates);
router.get('/fileUrls', auth.authorization, downloadsController.getDownloadLinks);
module.exports = router;
