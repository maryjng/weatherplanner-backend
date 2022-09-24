const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql")


class Appointments {
    //username should come from res.locals.user.username
    //data is { username, title, startdate, enddate, description, location }
    //startdate and enddate are timestamps (date and time)
    static async add(data) {
        let { username, title, startDate, endDate, description, location } = data
        const result = await db.query(
            `INSERT INTO appointments
            (username, title, startDate, endDate, description, location)
            values ($1, $2, $3, $4, $5, $6)
            RETURNING (id, username, title, startDate, endDate, description, location)`, [username, title, startDate, endDate, description, location]);
        const appt = result.rows[0]
        return appt;
    }


    //get all appts for user
    // static async getUserAppts(username) {
    //     const result = await db.query(
    //         `SELECT id, username, title, start, end, description, location 
    //         FROM appointments
    //         WHERE username=$1`, [username]
    //     );
    //     if (!result.rows[0]) throw new NotFoundError(`User ${username} does not exist.`)

    //     return result
    // }


    //get appt by id. Throws NotFoundError if not found
    static async get(id) {
        const result = await db.query(
            `SELECT id, username, title, startDate, endDate, description, location
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
    // takes id and data as { username, title, startDate, endDate, description, location  }
    // returns { username, title, startDate, endDate, description, location  }
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {})
        const handleVarIdx = "$" + (values.length + 1);

        const queryClause = 
            `UPDATE appointments
            SET ${setCols}
            WHERE id=${handleVarIdx}
            RETURNING (username, title, startDate, endDate, description, location)`

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
        const result = await db.query(
            `SELECT *
            FROM forecast
            WHERE appt_id=$1`, [id]
        );

        if (!result) throw new NotFoundError(`No appointment by ${id} exists.`)

        return result.rows
    }
}

module.exports = Appointments;