const express = require('express');

const router = express.Router();
const passwordController = require('../controllers/password-controller');

router.post('/forgotpassword', passwordController.forgotPassword);
router.get('/resetpassword/:reqId', passwordController.getPasswordUpdateForm);
router.get('/updatepassword/:resetpasswordid', passwordController.setPassword);

module.exports = router;
