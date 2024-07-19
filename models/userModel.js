const pool = require('../config/db');

const createUser = async (id, hashedPassword) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO users (id, password) VALUES ($1, $2) RETURNING id',
            [id, hashedPassword]
        );
        return result.rows[0].id;
    } finally {
        client.release();
    }
};

const getUserById = async (id) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

module.exports = {
    createUser,
    getUserById,
};
