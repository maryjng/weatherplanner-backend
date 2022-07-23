const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { WEATHERCODE, getLatAndLong } = require("../helpers/latLong")

class Appointments {
    // dateStart and end are Date objects
    static async add(user_id, { name, dateStart, dateEnd, description }) {
        const result = await db.query(
            `INSERT INTO appointments
            (name, dateStart, dateEnd, description, user_id)
            values ($1, $2, $3, $4)
            RETURNING (id, name, dateStart, dateEnd, description, user_id)`, [name, dateStart, dateEnd, description, user_id]);
        const appt = result.rows[0]
        return appt;
    }


    //get appt by id. Returns appt details including the saved forecast. Throws NotFoundError if not found
    static async get(id) {
        const result = await db.query(
            `SELECT a.name, a.dateStart, a.dateEnd, a.location, a.zipcode, a.description, a.user_id, f.max_temp, f.min_temp, f.weather_code
            FROM appointments a JOIN forecast f ON a.id = f.appt_id
            WHERE id=$1`, [id]
        );
        const appt = result.rows[0]
        if (!appt) throw new NotFoundError(`Appointment ${id} does not exist.`);

        let weather = WEATHERCODE[appt.weather_code]

        const apptRes = { 
            name: appt.name,
            dateStart: appt.dateStart,
            dateEnd: appt.dateEnd,
            location: appt.location,
            zipcode: appt.zipcode,
            description: appt.description,
            forecast: {
                max_temp: appt.max_temp,
                min_temp: appt.min_temp,
                weather: weather,
            }
        }
        return apptRes;
    }


    // updates appt by id
    // takes id, data where data can include { name, dateStart, dateEnd, description }
    // returns { name, dateStart, dateEnd, description }
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data)
        const handleVarIdx = "$" + (values.length + 1);

        const sqlQuery = `UPDATE appointments
                            SET ${setCols}
                            WHERE id = ${id}
                            RETURNING name, dateStart, dateEnd, description, user_id`
        const result = await db.query(sqlQuery, [...values, id]);
        const appt = result.rows[0]
    
        if (!appt) throw new NotFoundError(`No appointment by ${id} exists.`)

        return result.rows[0]
    }

    // deletes appt
    static async delete(id) {
        const result = await db.query(
            `DELETE appointments
            WHERE id=$1
            RETURNING name`, [id]
        );
        const appt = result.rows[0]

        if (!appt) throw new NotFoundError(`No appointment by ${id} exists.`)

        return appt;
    }

}



export default Appointments;