"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT username,
                  password,
                  email,
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }
    throw new UnauthorizedError("Invalid username/password");
  }


    // registers new user.    
    // * Throws BadRequestError on duplicates.

    static async register(
      { username, password, email}) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate user: ${username}`);
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users
      (username, password, email)
      VALUES ($1, $2, $3)
      RETURNING username, email`, [username, hashedPassword, email]);

      const user = result.rows[0];

      return user;
    }


    // gets user by id. returns { username, email, [ appts ids ] }
    // * Throws NotFoundError if user not found.

    static async get(id) {
      const userRes = await db.query(
          `SELECT username, email
          FROM users
          WHERE id = $1`, [id])

      const apptRes = await db.query(
        `SELECT id
        FROM appointments
        WHERE user_id = $1`, [id]
      )
      const appts = apptRes.rows
      const user = userRes.rows[0]

      if (!user) throw new NotFoundError(`User ${id} does not exist.`);

      return {...user, appts };
    }


    //updates user by id. Can take { password, email }.
    // returns { username, email }
    // Throws NotFoundError if user not found.
    static async update(id, data) {
      //hash password
      if (data.password) {
        data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR)
      }
      const { setCols, values } = sqlForPartialUpdate(data)
      const handleVarIdx = "$" + (values.length + 1);

      const sqlQuery = `UPDATE users
                          SET ${setCols}
                          WHERE id = ${id}
                          RETURNING username, email`
      const result = await db.query(sqlQuery, [...values, id]);
      const appt = result.rows[0]
  
      if (!appt) throw new NotFoundError(`No appointment by ${id} exists.`)

      return result.rows[0]
  }

    
      //Need some auth check
    //delete user by username
      static async remove(username) {
        let result = await db.query(
              `DELETE
               FROM users
               WHERE username = $1
               RETURNING username`,
            [username],
        );
        const user = result.rows[0];
    
        if (!user) throw new NotFoundError(`User does not exist: ${username}`);

        return user;
      }

}


module.exports = User;