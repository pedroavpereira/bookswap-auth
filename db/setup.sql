DROP TABLE IF EXISTS users;

CREATE TABLE users(
    user_id INT GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(10) NOT NULL,
    password VARCHAR(100),
    postcode VARCHAR(10),
    PRIMARY KEY(id)
);

CREATE TABLE users_reviews(
    review_id INT GENERATED ALWAYS AS IDENTITY,
    rating INT NOT NULL,
    message VARCHAR(600) NOT NULL,
    user_id INT FORIEGN KEY,
    PRIMARY KEY(review_id)
);



CREATE TABLE books(
    book_id INT GENERATED ALWAYS AS IDENTITY,
    title INT NOT NULL,
    author VARCHAR(600) NOT NULL,
    genre INT FORIEGN KEY,
    lang VARCHAR(600) NOT NULL,
    isbn INT NOT NULL,
    image VARCHAR(200),
    deliver_options STRING[]
    PRIMARY KEY(book_id)
);



CREATE TABLE messages(
    message_id INT GENERATED ALWAYS AS IDENTITY,
    room_id VARCHAR(20) UNIQUE NOT NULL,
    user_sent INT FORIEGN KEY,
    message VARCHAR(500),
    sent_at TIMESTAMP,
    PRIMARY KEY(message_id)
);


CREATE TABLE chat_rooms(
    room_id INT GENERATED ALWAYS AS IDENTITY,
    user_1 INT FORIEGN KEY,
    user_2 INT FORIEGN KEY,
    swap_id VARCHAR(500),
    PRIMARY KEY(room_id)
);

CREATE TABLE swap(
    swap_id INT GENERATED ALWAYS AS IDENTITY,
    user_requesting INT FORIEGN KEY,
    collection_requested INT FORIEGN KEY,
    user_offered INT FORIEGN KEY,
    collection_offered INT FORIEGN KEY, 
    created_at TIMESTAMP,
    status VARCHAR(50),
    completed BOOLEAN
    PRIMARY KEY(swap_id)
);


CREATE TABLE book_collections(
    collection_id INT GENERATED ALWAYS AS IDENTITY,
    book_id INT FORIEGN KEY,
    user_id INT FORIEGN KEY,
    PRIMARY KEY(book_collections_id)
);