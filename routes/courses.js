const express = require('express');
const router = express.Router({ mergeParams : true });
//add or generate in or merge automaticaly at router.route(/:bootcampId/courses').get(getCourses) so we need to pass object as parameter in express.Router()..basically it not physically present but it added dynamically 
//i.e router.route('/:bootcampId/courses').get(getCourse) whenever a we call route which provide courses associated with Bootcamp id and its courses

console.log('Inside Route file');
const {getCourses,getCourse,addCourse,updateCourse,deleteCourse} = require('../controllers/courses');

//for middleware advancedResults
const Course = require('../models/Course.js');
const advancedResults = require('../middlewares/advancedResults.js');

const { protect , authorize } = require('../middlewares/auth.js');

//route(/:bootampId).get(courses)..this line dyncamically added or merge..i write here for my understanding
/* router
.route('/') 
.get(getCourses)
.post(addCourse) */
//so here we pass model and populate(specific fields)
router
.route('/') 
.get(advancedResults(Course ,{
        path : 'bootcamp',
        select : 'name description'
    }),getCourses)
.post(protect , authorize('publisher' , 'admin') , addCourse)

router
.route('/:courseId')
.get(getCourse)
.put(protect , authorize('publisher' , 'admin') , updateCourse)
.delete(protect , authorize('publisher' , 'admin') , deleteCourse)

module.exports = router;
//protect is our custom middleware which is used to validate the token .AS we know at the time of login we get token from server .so this token require at the time of create ,update and delete a resources(Bootcamp,course).
//so basically this middleware verify the token of client with the secret (which is use at the time of token generation at server side).if it s valid token then it returns payload object..payload contain id(User Id)

