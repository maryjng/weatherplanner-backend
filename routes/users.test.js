// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const router = express.Router();
const db = require("../db");

let testUser;
let testAppt;

beforeEach(async function() {
    const res = await db.query(
        `INSERT INTO users
        (username, password, email)
        values ("testuser", "HASHED_PASSWORD", "test@gmail.com")
        RETURNING username, password, email`
    )
    testUser = res.rows[0]

    const apptRes = await db.query(
        `INSERT INTO appointments
        (username, title, startDate, endDate, description, location, zipcode) VALUES ('testuser', 'birthday party', '2022-09-17T12:45:00.000Z', '2022-09-17T13:30:00.000Z', 'celebrate kittys birthday' '123 test lane', '08816')
        RETURNING id, username, title, startDate, endDate, description, location, zipcode`
    )
    testAppt = apptRes.rows[0]
})

afterEach(async function() {
    await db.query("DELETE FROM users");
});

afterAll(async function() {
    await db.end();
});

/////

describe("POST /users", () => {
    test("Create new user", async function() {
        const res = await request(app).post(`/users`).send({
            "username": "testnewuser",
            "password": "PASSWORD_OF_HASH",
            "email": "testnew@gmail.com"
        })
        expect(res.statusCode).toEqual(201);
        expect(res.response).objectContaining({
            "user": {
                "username": "testnewuser",
                "email": "testnew@gmail.com"
            }
        })
    })
})

describe("GET /users/:username", () => {
    test("Get user by username", async function() {
        const res = await request(app).get(`/users/testuser`)
        expect(res.status).toEqual(200);
        expect(res.response).toBe({
            username: "testuser",
            password: "HASHED_PASSWORD",
            email: "test@gmail.com",
            appointments: [{
                "id": 1,
                "title": "birthday party",
                "startdate": '2022-09-17T12:45:00.000Z', 
                "enddate": '2022-09-17T13:30:00.000Z',
                "description": "celebrate kittys birthday",
                "location": "123 test lane",
                "zipcode": "08816",
            }]
        });
    });
})

describe("PATCH /users/:username", () => {
    test("Update user details", async function() {
        const res = await request(app).patch(`/users/testuser`).send({
            "email": "testpatch@gmail.com",
            "currPassword": "HASHED_PASSWORD"
        });
        expect(res.response).toEqual({
            "updated": {
                "username": "testuser",
                "email": "testpatch@gmail.com"
            }
        })
    })
})


