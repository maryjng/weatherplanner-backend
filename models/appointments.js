const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql")


class Appointments {
    //username should come from res.locals.user.username
    //data is { name, dateStart, dateEnd, description, location }
    //dateStart and end are timestamps (date and time)
    static async add(username, data) {
        let { name, dateStart, dateEnd, description, location } = data
        const result = await db.query(
            `INSERT INTO appointments
            (username, name, dateStart, dateEnd, description, location)
            values ($1, $2, $3, $4, $5, $6)
            RETURNING (id, username, name, dateStart, dateEnd, description, location)`, [username, name, dateStart, dateEnd, description, location]);
        const appt = result.rows[0]
        return appt;
    }


    //get appt by id. Throws NotFoundError if not found
    static async get(id) {
        const result = await db.query(
            `SELECT username, name, dateStart, dateEnd, description, location
            FROM appointments
            WHERE id=$1`, [id]
        );
        const appt = result.rows[0]
        if (!appt) throw new NotFoundError(`Appointment ${id} does not exist.`);

        return appt;
    }


    // get username of appt's creator
    static async getApptUser(id){
        const result = await db.query(
            `SELECT username
            FROM appointments
            WHERE id=$1`, [id]
        )
        const user = result.rows[0]
        if (!user) throw new NotFoundError(`Appointment ${id} does not exist.`)

        return user.username;
    }
    

    // updates appt by id
    // takes id and data as { username, name, dateStart, dateEnd, description, location }
    // returns { username, name, dateStart, dateEnd, description, location }
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, { dateStart: "datestart", dateEnd: "dateend"})
        const handleVarIdx = "$" + (values.length + 1);

        const queryClause = 
            `UPDATE appointments
            SET ${setCols}
            WHERE id=${handleVarIdx}
            RETURNING (username, name, dateStart, dateEnd, description, location)`

        const result = await db.query(queryClause, [...values, id])
        const appt = result.rows[0]
    
        if (!appt) throw new NotFoundError(`No appointment by ${id} exists.`)

        return appt;
    }

    // deletes appt
    static async remove(id) {
        const result = await db.query(
            `DELETE appointments
            WHERE id=$1
            RETURNING name`, [id]
        );

        if (!result) throw new NotFoundError(`No appointment by ${id} exists.`)

        return result.rows[0]
    }

    
    // get all forecasts for an appt
    static async getApptForecasts(id) {
        const result = await db.qery(
            `SELECT *
            FROM forecasts
            WHERE appt_id=$1`, [id]
        );

        if (!result) throw new NotFoundError(`No appointment by ${id} exists.`)

        return result.rows
    }
}

module.exports = Appointments;