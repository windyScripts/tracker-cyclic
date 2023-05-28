const express = require('express');

const router = express.Router();
const purchaseController = require('../controllers/purchase-controller');
const auth = require('../middleware/auth');

router.get('/createorder', auth.authorization, purchaseController.premium);
router.post('/updatetransactionstatus', auth.authorization, purchaseController.updateTransactionStatus);

module.exports = router;
