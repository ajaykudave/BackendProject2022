const express = require('express');
const router = express.Router({ mergeParams : true });
//add or generate in or merge automaticaly at router.route(/:bootcampId/courses').get(getCourses) so we need to pass object as parameter in express.Router()..basically it not physically present but it added dynamically 
//i.e router.route('/:bootcampId/courses').get(getCourse) whenever a we call route which provide courses associated with Bootcamp id and its courses

console.log('Inside Route file');
const {getCourses,getCourse,addCourse,updateCourse,deleteCourse} = require('../controllers/courses');

//for middleware advancedResults
const Course = require('../models/Course.js');
const advancedResults = require('../middlewares/advancedResults.js');

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
.post(addCourse)

router
.route('/:courseId')
.get(getCourse)
.put(updateCourse)
.delete(deleteCourse)

module.exports = router;

