const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const uploadFile = async (req, res) => {
    const { originalname, mimetype, size, filename } = req.file;
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO files (name, extension, mime_type, size, upload_date, path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [originalname, path.extname(originalname), mimetype, size, new Date(), filename]
        );
        res.json({ fileId: result.rows[0].id });
    } finally {
        client.release();
    }
};

const listFiles = async (req, res) => {
    const { list_size = 10, page = 1 } = req.query;
    const offset = (page - 1) * list_size;
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM files LIMIT $1 OFFSET $2', [list_size, offset]);
        res.json(result.rows);
    } finally {
        client.release();
    }
};

const getFile = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM files WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json(result.rows[0]);
    } finally {
        client.release();
    }
};

const downloadFile = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM files WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        const file = result.rows[0];
        res.download(path.join(__dirname, '../uploads', file.path), file.name);
    } finally {
        client.release();
    }
};

const deleteFile = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query('DELETE FROM files WHERE id = $1 RETURNING path', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        const filePath = result.rows[0].path;
        fs.unlinkSync(path.join(__dirname, '../uploads', filePath));
        res.json({ message: 'File deleted' });
    } finally {
        client.release();
    }
};

const updateFile = async (req, res) => {
    const { id } = req.params;
    const { originalname, mimetype, size, filename } = req.file;
    const client = await pool.connect();
    try {
        const result = await client.query(
            'UPDATE files SET name = $1, extension = $2, mime_type = $3, size = $4, upload_date = $5, path = $6 WHERE id = $7 RETURNING path',
            [originalname, path.extname(originalname), mimetype, size, new Date(), filename, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        const oldFilePath = result.rows[0].path;
        fs.unlinkSync(path.join(__dirname, '../uploads', oldFilePath));
        res.json({ message: 'File updated' });
    } finally {
        client.release();
    }
};

module.exports = {
    uploadFile,
    listFiles,
    getFile,
    downloadFile,
    deleteFile,
    updateFile,
};