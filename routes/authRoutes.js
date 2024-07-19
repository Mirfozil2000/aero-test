const express = require('express');
const { signup, signin, refreshToken, info, logout } = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin); 
router.post('/signin/new_token', refreshToken);
router.get('/info', verifyToken, info);
router.get('/logout', verifyToken, logout);

module.exports = router;