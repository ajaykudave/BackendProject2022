const NodeGeocoder = require('node-geocoder');
//Load env variables..whenever we want to use env variable to the location other than it defination then we need to specify location of env using require()
require('dotenv').config({ path : './config/config.env'});
//console.log(process.env);
const options ={
    //console.log(process.env);
    provider : process.env.GEOCODER_PROVIDER,
    httpAdapter : 'https',
    apiKey : process.env.GEOCODER_API_KEY,
    formatter : null
};

const geoCoder = NodeGeocoder(options);
module.exports = geoCoder;