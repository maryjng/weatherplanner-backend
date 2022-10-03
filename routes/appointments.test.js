// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const router = express.Router();
const db = require("../db");

let testAppt;
let testForecast1;
let testForecast2;

beforeEach(async function() {
    let result = await db.query(`
      INSERT INTO
        appointments (username, title, startDate, endDate, description, location, zipcode) VALUES ('testuser', 'birthday party', '2022-09-17T12:45:00.000Z', '2022-09-17T13:30:00.000Z', 'celebrate kittys birthday' '123 test lane', '08816')
        RETURNING id, username, title, startDate, endDate, description, location, zipcode`);
    testAppt = result.rows[0];

    let forecastRes = await db.query(`
        INSERT INTO
        appointments (appt_id, date, longitude, latitude, max_temp, min_temp, weather)
        VALUES ("appt_id": 1, "date": "2022-09-17",  "latitude": 40.375, "longitude": -74.375,
        "max_temp": 50, "min_temp": 30, "weather": "slight rain"), ("appt_id": 1, "date": "2022-09-18",  "latitude": 40.375, "longitude": -74.375, "max_temp": 60, "min_temp": 40, "weather": "moderate rain showers")
        RETURNING id, appt_id, date, longitude, latitude, max_temp, min_temp, weather`)
    testForecast1 = forecastRes.rows[0];
    testForecast2 = forecastRes.rows[1]
});

afterEach(async function() {
    await db.query("DELETE FROM appointments");
});

afterAll(async function() {
    await db.end();
});

/////

describe("GET /appointments/:id", () => {
    test("Get appointment by id 1", async () => {
        const res = await request(app).get('/appointments/1')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual(testAppt)
    })
})


describe("POST /appointments/", () => {
    test("Post a new appointment", async () => {
        const res = await request(app).post('/appointments')
        .send({
            "username": "testuser1",
            "title": "LAN party",
            "startDate": "2022-10-01T08:00:00.000Z",
            "endDate": "2022-10-03-T13:37:00.000z",
            "description": "bring your PC",
            "location": "456 test street",
            "zipcode": "12345"
        })
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            id: expect.any(Number),
            username: testuser1
        });
    });
});
describe("PATCH /appointments/:id", function() {
    test("updates an appointment by id", async function() {
        const res = await request(app).patch(`/appointments/1`)
        .send({
            "username": "testpatch"
        });
        expect(res.statusCode).toEqual(200);
        expect(res.response).toEqual({
            data: {
                "id": 1, 
                "username": "testpatch",
                "startdate": "2022-09-17T12:45:00.000Z",
                "enddate": "2022-09-17T13:30:00.000Z",
                "description": "celebrate kittys birthday",
                "location": "123 test lane",
                "zipcode": "08816"
        }
        });
    });
});

describe("DELETE /appointments/:id", function() {
    test("Deletes an appointment by id", async function() {
        const res = await request(app).delete(`/appointments/1`)
        expect(res.statusCode).toEqual(200)
        expect(res.response).toEqual({"deleted": {
            id: 1,
            title: "birthday party"
        }
        });
    });
});

describe("GET /appointments/:id/forecast", function() {
    test("Gets all forecasts for appointment by id", async function() {
        const res = await request(app).get(`/appointments/1/forecast`)
        expect(res.statusCode).toEqual(200);
        expect(res.response).toEqual({"forecasts": [testForecast1, testForecast2]
        });
    });
})

describe("POST /appointments/:id/forecast", function() {
    test("Posts new forecast for appointment of id", async function() {
        const res = await request(app.post(`/appointments/1/forecast`)
        .send({
            "date": "2022-10-06",
            "latitude": 40.375,
            "longitude": -74.375,
            "min_temp": 20,
            "max_temp": 40,
            "weather": "hail"
        }))
        expect(res.statusCode).toEqual(201);
        expect(res.response).toEqual({
            "appt_id": 1,
            "date": "2022-10-06",
            "latitude": 40.375,
            "longitude": -74.375,
            "min_temp": 20,
            "max_temp": 40,
            "weather": "hail"
        });
    });
})

