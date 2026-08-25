require('dotenv').config();
const app = require('./app');
const {sequelize,connectDB}=require('./config/db');
const logger = require('./config/logger');
const PORT =process.env.PORT || 5000;
const start = async ()=> {
    try{
        await connectDB();
        await sequelize.sync({alter: process.env.NODE_ENV==='development'});
        app.listen(PORT, ()=> {
            logger.info(`Server running in ${process.env.NODE_ENV || 'development'}`)
        });
    }
    catch(err) {
        logger.error({err}, 'Failed to start server');
        process.exit(1);
    }
};
process.on('unhandledRejection', (err)=>{
    logger.error({err}, 'Unhandled promise rejection. shutting down...');
});
start();