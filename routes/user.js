const express = require('express');

const router = express.Router();
const userRoutes = require('../controllers/user-controller');

// new user registration

router.post('/new', userRoutes.addUser);

// user login

router.post('/login', userRoutes.login);

module.exports = router;
