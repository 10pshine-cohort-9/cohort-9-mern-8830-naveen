const {Sequelize} = require('sequelize');
const logger = require('./logger');
let sequelize;
if(process.env.NODE_ENV ==='test'){
    sequelize =new Sequelize('sqlite::memory:', {logging: false});
}
else{
    sequelize = new Sequelize(
        process.env.DB_NAME || 'notes_app', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {host: process.env.DB_HOST || 'localhost', port: process.env.DB_PORT || 3306, dialect:'mysql', logging: (msg)=> logger.debug(msg), pool: {max:10, min: 0, acquire: 30000, idle: 10000},
    }
    );
}
const connectDB = async ()=>{
    try{
        await sequelize.authenticate();
        logger.info("Database connected");
    }
    catch(err){
        logger.error({err}, "Unable to connect to the database");
        throw err;
    }
};

module.exports ={sequelize, connectDB}