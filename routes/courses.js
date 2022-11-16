const express = require('express');
const router = express.Router({ mergeParams : true });
//add or merge automaticaly at router.route(/:bootcampId/courses').get(getCourses) so we need to pass object as parameter in express.Router()

console.log('Inside Route file');
const {getCourses,getCourse,addCourse,updateCourse,deleteCourse} = require('../controllers/courses');

router
.route('/') 
.get(getCourses)
.post(addCourse)

router
.route('/:courseId')
.get(getCourse)
.put(updateCourse)
.delete(deleteCourse)

module.exports = router;

