const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Appointments {
    // dateStart and end are Date objects
    static async add({ name, dateStart, dateEnd, description, user_id }) {
        const result = await db.query(
            `INSERT INTO appointments
            (name, dateStart, dateEnd, description, user_id)
            values ($1, $2, $3, $4)
            RETURNING (id, name, dateStart, dateEnd, description, user_id)`, [name, dateStart, dateEnd, description, user_id]);
        const appt = result.rows[0]
        return appt;
    }


    //get appt by id. Throws NotFoundError if not found
    static async get(id) {
        const result = await db.query(
            `SELECT name, dateStart, dateEnd, description, user_id
            FROM appointments
            WHERE id=$1`, [id]
        );
        const appt = result.rows[0]
        if (!appt) throw new NotFoundError(`Appointment ${id} does not exist.`);

        return appt;
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

module.exports = Appointments;