const advancedResults =(model ,populate) => async (req , res , next) => {

    //----paste here code from bootcamp controller

     /*NOTE:****we create our own custom middleware which containn pagination and advance feature so that we can reuse that thing for other resources..i.e we can use it somewhere else we need..previously we include pagination functionality for Bootcamp only ..now we want that when we get Course it also include pagination...so we use the our middleware in that place where we need to include that advance feature...so no need to type again Pagination and other stuff(like sort) for Courses also.****** 
            
            step1)inside middleware folder ->create new file advanceResult
            step2)and where we use Bootcamp ..replace that with model(its called generic mean if we implement that for Course model then that also possible.. )
            step3)where use bootcamp use result 
            */
            let query;

            //now we are going to create our req.query for that we need to use spread opertor
            const reqQuery = {...req.query };//we copy all express req.query properties into our local variable
            //so we get that query parameters here passed from postman using express req.query 
           // let queryStr = JSON.stringify(req.query);

           const removeFields = ['select','sort','page','limit'];//array

           //Loop over removeFields array and delete select from reqQuery
           removeFields.forEach((params) => delete reqQuery[params]);

            let queryStr = JSON.stringify(reqQuery);

            queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,(match)=>`$${match}`);
            //so basically we write logic to put $ sign in front of query operator operator..eg..$gt
            //lte,gt these are mongoose operators and \b is word boundry character


             /* also there is reverse populate .i.e for each bootcamp we want to show their provided courses list..so for that we need reverse populate using virtual (bec each bootcamp has multiple courses(One to Many.) but each Course doesnot have multiple Bootcamp) ..for this we need to change in Bootcamp controller and model file*/
             

            console.log(queryStr);
         //fetch bootcamp from db(this method return array)
        //finding resource (bootcamps)
       /* query = Bootcamp.find(JSON.parse(queryStr)).populate({
            path : 'courses',
            select : 'title description'
        }); // reverse populate specific field with data
        */
    // query = model.find(JSON.parse(queryStr)).populate('courses');
        query = model.find(JSON.parse(queryStr));//we remove populate we add that in route file

      //  console.log(req.query.select);
        //Select Fields
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');//join make whole array element as single string with space an return
            console.log(fields);
            query = query.select(fields);//return specified field with data
        }

        //Sort(Ascending =1  and descending = -1)
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');//join make whole array element as single string with space an return
            console.log(sortBy);
            query = query.sort(sortBy);//return specified field with data
        }else{
            //sort by default date in our model
            query = query.sort('-createdAt');
        }

        //Pagination
        const page = parseInt(req.query.page,10) || 1; //page number
        const limit = parseInt(req.query.limit,10) || 1; //number of document or record(bootcamp) should displayed on a page..if we  remove 25 and add 1 on that place then when we use pagination we see next field
        //const skip = (page - 1)* limit;
        const startIndex = (page - 1)* limit;
        const endIndex = page * limit;
        //const total = await Bootcamp.countDocuments();
        const total = await model.countDocuments();

        query = query.skip(startIndex).limit(limit);

        //we add populate here
        if(populate){
            query = query.populate(populate);
        }

        //executing query
       // const bootcamps = await query;
        const results = await query;

        //Pagination Result
        const pagination = {}; //blank Object
        
        //previous and next buton like feature suppose we have total 10 page and we are currently on(i.e endindex=8)8th page then in response we display next=8+1=9..i.e next=9 th page  
        if(endIndex < total){
            pagination.next ={
                page : page + 1,
                limit :limit
            }
        }

        //here we see preious page number
        if(startIndex > 0){
            pagination.pre = {
                page : page - 1,
                limit :limit //if we add only limit i.e that also fine because value also limit 
            }
        }
        //here we create object on response object mean inside res oject we pass or create our success object
        res.advancedResults ={
            success : true,
            count   : results.length,
            pagination : pagination,     //if key : value are same then we can add only key ..it works
            data : results
        }
        
        next();
        /* What does next () do in middleware?
           The next() function is a function in the Express router that, when invoked, executes the next middleware in the middleware stack. If the current middleware function does not end the request-response cycle, it must call next() to pass control to the next middleware function. Otherwise, the request will be left hanging */
}

module.exports = advancedResults;