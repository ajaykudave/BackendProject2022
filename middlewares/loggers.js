const logger = (req ,res ,next)=>{
   
    console.log(`${req.method} ${req.protocol} ://${req.get('host')}${req.originalUrl}`);
    next();//in every middleware there is we need to add next().so it moves control next middleware function
}

//export
module.exports = logger;
 