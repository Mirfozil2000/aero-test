const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserById } = require('../models/userModel');
require('dotenv').config();

const generateToken = (userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET);
    return { token, refreshToken };
};

const signup = async (req, res) => {
    const { id, password } = req.body;
    try {
        const existingUser = await getUserById(id);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await createUser(id, hashedPassword);
        const { token, refreshToken } = generateToken(userId);
        res.json({ token, refreshToken });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Server error' });
    }
};

const signin = async (req, res) => {
    const { id, password } = req.body;
    try {
        const user = await getUserById(id);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const { token, refreshToken } = generateToken(user.id);
        res.json({ token, refreshToken });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        const { token, newRefreshToken } = generateToken(user.id);
        res.json({ token, refreshToken: newRefreshToken });
    });
};

const info = (req, res) => {
    res.json({ id: req.user.id });
};

const logout = (req, res) => {
    res.json({ message: 'Logged out' });
};

module.exports = {
    signup,
    signin,
    refreshToken,
    info,
    logout,
};
