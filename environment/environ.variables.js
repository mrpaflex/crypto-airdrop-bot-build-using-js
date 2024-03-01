const dotenv = require('dotenv');
dotenv.config();

 const EnvironVariables={
    DB_UR: process.env.DB_URL,
    PORT: process.env.PORT,
   
    
   BOT: {
        BOT_TOKEN: process.env.BOT_TOKEN,
        BOT_USERNAME: process.env.BOT_USERNAME,
        ADMINS: process.env.ADMINS,
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
    }
}

module.exports = { EnvironVariables };