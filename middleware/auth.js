"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const Appointment = require("../models/appointments");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}


/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param OR be user matching username of provided appt id
 *
 *  If not, raises Unauthorized.
 */
async function ensureCorrectUser(req, res, next) {
  try {
    const user = res.locals.user;
    let apptUser = ""

    if (req.params.appt_id) {
      apptUser = await Appointment.getApptUser(req.params.appt_id)
    };
      
    if (!
      //user must be true
      (user && 
        // AND the below must be true, meaning at least one side of || 
        (user.username === req.params.username || user.username === apptUser))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
};
