const AppError = require('../utils/AppError');
const validate =(requiredFields)=> (req, res, next)=> {
    const missing = requiredFields.filter((field)=> {
        const value = req.body?.[field];
        if(value === undefined || value === null){
            return true;
        }
        if(typeof value !== 'string'){
            return true;
        }
        return value.trim()==='';
    });
    if(missing.length>0){
        return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
    }
    next();
};
module.exports = validate;