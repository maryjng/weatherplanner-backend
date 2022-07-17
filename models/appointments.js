const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");


class Appointments {
    // dateStart and end are Date objects
    static async add({ name, dateStart, dateEnd, description }) {
        const result = await db.query(
            `INSERT INTO appointments
            (name, dateStart, dateEnd, description)
            values ($1, $2, $3, $4)
            RETURNING (id, name, dateStart, dateEnd, description)`, [name, dateStart, dateEnd, description]);
        const appt = result.rows[0]
        return appt;
    }


    //get appt by id. Throws NotFoundError if not found
    static async get(id) {
        const result = await db.query(
            `SELECT name, dateStart, dateEnd, description
            FROM appointments
            WHERE id=$1`, [id]
        );
        const appt = result.rows[0]
        if (!appt) throw new NotFoundError(`Appointment ${id} does not exist.`);

        return appt;
    }


    // updates appt by id
    // takes id, name, dateStart, dateEnd, description }
    // returns { name, dateStart, dateEnd, description }
    static async update(id, name, dateStart, dateEnd, description) {
        const result = await db.query(
            `UPDATE appointments
            SET name=$1, dateStart=$2, dateEnd=$3, description=$4
            WHERE id=$5
            RETURNING (name, dateStart, dateEnd, description)`, [name, dateStart, dateEnd, description, id]
        );
    
        if (!result) throw new NotFoundError(`No appointment by ${id} exists.`)

        return result.rows[0]
    }

    // deletes appt
    static async delete(id) {
        const result = await db.query(
            `DELETE appointments
            WHERE id=$1
            RETURNING name`, [id]
        );

        if (!result) throw new NotFoundError(`No appointment by ${id} exists.`)

        return result.rows[0]
    }
}

module.exports = Appointment;