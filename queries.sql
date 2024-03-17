CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE joke (
    id INT AUTO_INCREMENT PRIMARY KEY,
    joke_text TEXT,
    category_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE moderator_joke (
    id INT AUTO_INCREMENT PRIMARY KEY,
    joke_text TEXT,
    category_id INT,
    is_approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES category(id)
);