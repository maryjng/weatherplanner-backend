"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql")

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT username,
                  password,
                  email
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

    throw new UnauthorizedError("Invalid password");
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


    // gets user by username
    // also returns all appts for the user
    // * Throws NotFoundError if user not found.

    static async get(username) {
      const userRes = await db.query(
          `SELECT username, email
          FROM users
          WHERE username = $1`, [username])

      const user = userRes.rows[0]
      if (!user) throw new NotFoundError(`User does not exist: ${username}`);

      const appointmentsRes = await db.query(
        `SELECT id, title, startDate, endDate, description, location
        FROM appointments
        WHERE username=$1`, [username]
      );

      const appointments = appointmentsRes.rows

      let response = {...user, appointments}

      return response;
    }

    //update user by username
    static async updateUser(username, data) {
      const { password } = data
      //if password is sent as part of data, hash it for storage in db
      if (password) {
        data["password"] = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
      }

      const { setCols, values } = sqlForPartialUpdate(data, {})
      const handleVarIdx = "$" + (values.length + 1);

      const queryClause = 
          `UPDATE users
          SET ${setCols}
          WHERE username=${handleVarIdx}
          RETURNING username, email`

      const result = await db.query(queryClause, [...values, username])
      const res = result.rows[0]
  
      if (!res) throw new NotFoundError(`No user by ${username} exists.`)

      return res;
    }
      
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
      }
}


module.exports = User;