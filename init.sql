CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(50) NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    size BIGINT NOT NULL,
    upload_date TIMESTAMP NOT NULL,
    path VARCHAR(255) NOT NULL
);