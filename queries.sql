CREATE TABLE type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE joke (
    id INT AUTO_INCREMENT PRIMARY KEY,
    joke_text TEXT,
    type_id INT,
    punch_line TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (type_id) REFERENCES type(id)
);

CREATE TABLE moderate_joke (
    id INT AUTO_INCREMENT PRIMARY KEY,
    joke_text TEXT,
    type_id INT,
    punch_line TEXT,
    is_approved BOOLEAN DEFAULT FALSE
);