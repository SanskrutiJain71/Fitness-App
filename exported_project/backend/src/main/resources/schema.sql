CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    profile_picture VARCHAR(255),
    weight DOUBLE DEFAULT 0,
    height DOUBLE DEFAULT 0,
    last_sync TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fitness_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    steps INT DEFAULT 0,
    calories INT DEFAULT 0,
    heart_rate INT DEFAULT 0,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sleep_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    date DATE,
    hours DOUBLE DEFAULT 0,
    deep_sleep_minutes INT DEFAULT 0,
    light_sleep_minutes INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
