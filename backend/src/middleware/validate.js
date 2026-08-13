const AppError = require('../utils/AppError');
const validate =(requiredFields)=> (req, res, next)=> {
    const missing = requiredFields.filter((field)=> {
        const value = req.body[field];
        return value === undefined || value === null || value==='';
    });
    if(missing.length>0){
        return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
    }
    next();
};
module.exports = validate;