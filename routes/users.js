const express = require('express');
const router  = express.Router();

const {getUsers , getUser , createUser , deleteUser, updateUser} = require('../controllers/users');
const User = require('../models/User');

const advancedResults       = require('../middlewares/advancedResults');
const {protect , authorize} = require('../middlewares/auth');

router.use(protect);
router.use(authorize('admin'));//so whichever routes below this ..get affected i.e automatically added protect and authorize() func in it

router
.route('/')
.get(advancedResults(User) , getUsers)//first it protect added automatically then authorize then getuser function 
.post(createUser)
//.get(protect , authorize('admin') ,advancedResults(User) , getUsers) instead of this we just add to router.use(protect) and router.use(authorize('admin'))

router
.route('/:userId')
.get(getUser)
.put(updateUser)
.delete(deleteUser)

module.exports = router;