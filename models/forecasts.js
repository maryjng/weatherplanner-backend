// MODEL FOR FORECASTS

const db = require("../db");
const {
  NotFoundError,
  BadRequestError
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql")


class Forecast {

    // adds a forecast to db
    // data is { latitude, longitude, date, max_temp, min_temp, weather }
    // meant to take the results of WeatherApi.parseRequestForDb
    static async add(appt_id, data) {
        console.log(data)
        const { latitude, longitude, date, max_temp, min_temp, weather } = data
        const result = await db.query(
            `INSERT INTO forecast
            (appt_id, latitude, longitude, date, max_temp, min_temp, weather)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING appt_id, latitude, longitude, date, max_temp, min_temp, weather`, [appt_id, latitude, longitude, date, max_temp, min_temp, weather]
        );

        let forecast = result.rows[0]
        if (!forecast) throw new NotFoundError(`Appointment ${id} does not exist.`)

        return forecast;
    }


    //PATCH existing forecast by id and appt_id
    //data can include {max_temp, min_temp, weather}
    //leaving out latitude, longitude, and date
    static async update(appt_id, id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {})
        const handleVarIdx1 = "$" + (values.length + 1);
        const handleVarIdx2 = "$" + (values.length + 2);

        const queryClause = 
            `UPDATE forecast
            SET ${setCols}
            WHERE appt_id=${handleVarIdx1} AND id=${handleVarIdx2}
            RETURNING appt_id, date, max_temp, min_temp, weather`

        const result = await db.query(queryClause, [...values, appt_id, id])
        const forecast = result.rows[0]
    
        if (!forecast) throw new NotFoundError(`No forecast by ${id} or appointment by ${appt_id} exists.`)

        return forecast;
    }

    //DELETE all forecasts for appointment by appt_id
    static async deleteAllForecasts(appt_id) {
        //check if the appt exists first
        const appt = await db.query(`
            SELECT * from appointments
            WHERE id=$1`, [appt_id])

        if (!appt.rows[0]) throw new NotFoundError(`No appt_id by ${appt_id} exists.`)

        const result = await db.query(`
            DELETE from forecast 
            WHERE appt_id=$1
            RETURNING appt_id`, [appt_id]
            );

        const res = result.rows[0]

        return res;
    }


}


module.exports = Forecast;