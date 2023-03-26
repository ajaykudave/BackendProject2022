const express = require('express');
const router  = express.Router();

console.log('Inside Route file');
const { registerUser , login , logout , getMe , forgetPassword , resetPassword ,updateUserDetails ,updatePassword} = require('../controllers/auth.js'); //destructuring

const { protect } = require('../middlewares/auth.js');
router
.route('/register')
.post(registerUser); 

 router
.route('/login')
.post(login);

router
.route('/logout')
.get(logout)

//this route is for bringing logined User data..here we put protect becasue where we check the token we got at the time of login and also we fetch login user data and attached to req objcet..so that it used in controller 
router
.route('/me')
.get(protect , getMe);
// .get(protect , authorize('publisher' , 'admin') , getMe);

router
.route('/forgetPassword')
.post(forgetPassword);

router
.route('/resetPassword/:resetToken')
.put(resetPassword);

router
.route('/updateUserDetails')
.put(protect , updateUserDetails);

router
.route('/updatePassword')
.put(protect ,updatePassword);
/* router
.post('/register' , registerUser)...we can write route this way also */

module.exports =router;