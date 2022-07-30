CREATE TABLE users (
    id SERIAL PRIMARY KEY
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
)

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    dateStart DATETIME NOT NULL,
    dateEnd DATETIME NOT NULL,
    location TEXT NOT NULL,
    zipcode INTEGER NOT NULL,
    description TEXT NOT NULL
    user_id INTEGER NOT NULL REFERENCES users
)

CREATE TABLE forecast (
    appt_id PRIMARY KEY NOT NULL REFERENCES appointments,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    max_temp DECIMAL NOT NULL,
    min_temp DECIMAL NOT NULL,
    weathercode INTEGER NOT NULL
)
