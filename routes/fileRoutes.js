const express = require('express');
const { uploadFile, listFiles, getFile, downloadFile, deleteFile, updateFile } = require('../controllers/fileController');
const verifyToken = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

const router = express.Router();

router.post('/file/upload', verifyToken, upload.single('file'), uploadFile);
router.get('/file/list', verifyToken, listFiles);
router.get('/file/:id', verifyToken, getFile);
router.get('/file/download/:id', verifyToken, downloadFile);
router.delete('/file/delete/:id', verifyToken, deleteFile);
router.put('/file/update/:id', verifyToken, upload.single('file'), updateFile);

module.exports = router;