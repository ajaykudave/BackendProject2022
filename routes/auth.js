const express = require('express');
const router  = express.Router();

console.log('Inside Route file');
const { registerUser , login , getMe} = require('../controllers/auth.js'); //destructuring

const { protect ,authorize} = require('../middlewares/auth.js');
router
.route('/register')
.post(registerUser); 

 router
.route('/login')
.post(login);

//this route is for bringing logined User data..here we put protect becasue where we check the token we got at the time of login and also we fetch login user data and attached to req objcet..so that it used in controller 
router
.route('/me')
.get(protect , authorize('publisher' , 'admin') , getMe);
/* router
.post('/register' , registerUser)...we can write route this way also */

module.exports =router;