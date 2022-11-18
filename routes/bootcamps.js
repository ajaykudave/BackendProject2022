//we maintain routes here in another file

const express = require('express');
const router  = express.Router(); //in order to use express router we first load express module

//so i bring that methods(controller logic)here by destructuring
const {getBootcamps,getBootcampById,createBootcamp,upadteBootcamp,deleteBootcamp, getBootcampByRadius,uploadPhotoForBootcamp} = require('../controllers/bootcamps.js'); //first dot tell out from routes folder then 2nd dot for root folder then controllers folder

//**so here we pass Bootcamp instance as argument for model parameter in advancedResults middleware function(model,populate)
const Bootcamp = require('../models/Bootcamp.js')
const advancedResults = require('../middlewares/advancedResults.js');

//Include other Resource routers
const courseRouter = require('./courses.js');

//Re-route(route forwarding) into other resource routers..means from bootcamps route we go to course route
router.use('/:bootcampId/courses' , courseRouter);//--look like /api/v1/bootcamps/:123344/courses..this will go to the course route file and where it add or merge automaticaly at router.route(/here).route(/:bootampId).get(courses)

router.route('/radius/:zipcode/:distance').get(getBootcampByRadius);

router
.route('/:bootcampId/photo')
.put(uploadPhotoForBootcamp)

/* so whenever we want to call or use that middleware we must pass into get() with our controller method..i.e get(middlewarename(parameters),controllerMethodName) */

/* router
.route('/')
.get(getBootcamps)
.post(createBootcamp); */
//***FLOW  OF CONTROL***[so whenever we call any route from postman it first come to server then --control go to route file --then controller method--then middleware nd middleware return some response back to controller..and end to controller]
/* suppose if we write like this .get(getBootcamps,advancedResults(Bootcamp,'courses'))..i,e first controller then middleware in parametr then it not work..so first midd then controller */
router
.route('/')
.get(advancedResults(Bootcamp,'courses'),getBootcamps)
.post(createBootcamp);

router
.route('/:bootcampId')
.put(upadteBootcamp)
.delete(deleteBootcamp)
.get(getBootcampById);




/* router.get('/' ,(req ,res)=>{
  
   
});
//get bootcamp by id if id =1 from db
router.get('/:id' ,(req,res)=>{

    res.status(200).json({
        success : true , msg : `Show bootcamp ${req.params.id}`
    });
});

//route for post
router.post('/',(req,res)=>{
    res.status(200).json({
        success : true, msg : 'Created new Bootcamp or data inserted'
    });
});
//update route
router.put('/:id',(req,res)=>{
    res.status(200).json({success : true,msg :`Updated bootcamp of Id ${req.params.id}`});
});
//delete route
router.delete('/:id' , (req,res)=>{
    res.status(200).json({
        success : true, msg : `deleted bootcamp of Id ${req.params.id}`
    })
});
 */
module.exports = router; //export so that it can used outside.