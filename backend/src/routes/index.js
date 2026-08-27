const express = require('express');
const authRoutes=require('./authRoutes');
const noteRoutes=require('./noteRoutes');
const router = express.Router();
router.get('/health', (req, res)=> res.status(200).json({success: true, status: 'ok'}));
router.use('/auth',authRoutes);
router.use('/notes', noteRoutes);
module.exports = router;