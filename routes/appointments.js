const jsonschema = require("jsonschema");

const { BadRequestError } = require("../expressError");
const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth")
const Appointment = require("../models/appointments");
const updateApptSchema = require("../schemas/updateAppt")
const router = new express.Router();

//save new appt in db. 
// Expects { username, name, dateStart, dateEnd, description, location} 
// returns { id, username, name, dateStart, dateEnd, description, location }
// must be logged in
router.post("/", ensureLoggedIn, async function(req, res, next) {
    try {
        let results = await Appointment.add(res.locals.user.username, req.body)
        return res.send(results)
    } catch (error) {
        return next(error)
    }
})


// gets appointment by id 
// returns { username, name, dateStart, dateEnd, description, location }
// must be logged in
router.get("/:id", ensureCorrectUser, async function(req, res, next) {
    try {
        let appointment = await Appointment.get(req.params.id)
        return res.json({ appointment })
    } catch (error) {
        return next(error)
    }
})


// updates appointment 
// returns { username, name, dateStart, dateEnd, description, location }
// must be appointment creator
router.patch("/:id", ensureCorrectUser, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, updateApptSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        const appt = await Appointment.update(req.params.id, req.body)
        return res.json({ appt })
    
    } catch (error) {
        return next(error)
    }
})


//deletes appointment
// NOT WORKING
router.delete("/:id", ensureCorrectUser, async function(req, res, next) {
    try {
        let deleted = await Appointment.remove(req.params.id)
        return res.json({ deleted })
    } catch (error) {
        return next(error)
    }
})

/////////////////////// FORECAST
// route to get all forecasts given appt id
router.get("/:id/forecast", ensureCorrectUser, async function(req, res, next) {
    try {
        const appointments = await Appointment.getApptForecasts(req.params.id)
        return res.json({ appointments })
    } catch (error) {
        return next(error)
    }
})

module.exports = router;

