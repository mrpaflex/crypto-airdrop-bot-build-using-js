const mongosse = require('mongoose');
 const {EnvironVariables} = require('../environment/environ.variables');



const connectDB = async ()=>{
    try {
        await mongosse.connect(EnvironVariables.DB_UR);
        console.log('database connected')
    } catch (error) {
        console.log(error)
    }
}

module.exports = {connectDB}