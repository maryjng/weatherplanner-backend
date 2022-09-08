CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1)
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL REFERENCES users,
    title TEXT NOT NULL,
    startdate TIMESTAMP NOT NULL,
    enddate TIMESTAMP NOT NULL,
    description TEXT,
    location TEXT NOT NULL
);

CREATE TABLE forecast (
    id SERIAL PRIMARY KEY,
    appt_id INTEGER NOT NULL REFERENCES appointments,
    date TIMESTAMP NOT NULL,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    max_temp DECIMAL NOT NULL,
    min_temp DECIMAL NOT NULL,
    weathercode INTEGER NOT NULL
);

CREATE TABLE zipcodes (
    zipcode CHAR(5) PRIMARY KEY,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL
);
