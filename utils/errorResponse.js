//So basically this utils is helper stuff some required things..so we setup here our own statuscode reponse by setending super class
class ErrorResponse extends Error 
{
    
    //contructor of ErrorResponse class
    constructor(message , statusCode){
        super(message);
        this.statusCode = statusCode;
       // this.message = message;
        //this is use to differentiate parametr name and our ErrorResponse class instance variables or member
        console.log('Inside ErrorResponse Class');
    }
}
module.exports = ErrorResponse;