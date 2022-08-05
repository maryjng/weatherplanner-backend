// MODEL FOR FORECASTS

const db = require("../db");
const {
  NotFoundError,
  BadRequestError
} = require("../expressError");
const newForecastSchema = require("../schemas/newForecast")


class Forecast {

    // adds a forecast to db
    // data is { latitude, longitude, date, max_temp, min_temp, weathercode }
    static async add(appt_id, data) {
        const { latitude, longitude, date, max_temp, min_temp, weathercode } = data
        const result = await db.query(
            `INSERT INTO forecast
            (appt_id, latitude, longitude, date, max_temp, min_temp, weathercode)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING appt_id, latitude, longitude, date, max_temp, min_temp, weathercode`, [appt_id, latitude, longitude, date, max_temp, min_temp, weathercode]
        );

        let forecast = result.rows[0]
        if (!forecast) throw new NotFoundError(`Appointment ${id} does not exist.`)

        return forecast;
    }
}