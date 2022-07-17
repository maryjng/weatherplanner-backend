CREATE TABLE users (
    username INTEGER PRIMARY KEY,
    password TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
)

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    dateStart DATETIME NOT NULL,
    dateEnd DATETIME NOT NULL,
    description TEXT NOT NULL
)