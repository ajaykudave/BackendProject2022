const express = require('express');
const router  = express.Router();

const { registerUser , login} = require('../controllers/auth.js'); //destructuring

/* router
.route('/register')
.post(registerUser); */

/* router
.route('/login')
.post(login); */
router
.post('/register' , registerUser)

module.exports =router;