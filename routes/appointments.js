const jsonschema = require("jsonschema");

const { BadRequestError } = require("../expressError");
const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth")
const Appointment = require("../models/appointments");
const Forecast = require("../models/forecasts")
const newApptSchema = require("../schemas/newAppt")
const updateApptSchema = require("../schemas/updateAppt")
const newForecastSchema = require("../schemas/newForecast")
const updateForecastSchema = require("../schemas/updateForecast")
const router = new express.Router();

//save new appt in db. 
// Expects { username, name, dateStart, dateEnd, description, location, zipcode} 
// only description is optional
// returns { id, username, name, dateStart, dateEnd, description, location, zipcode }
// must be logged in
router.post("/", ensureLoggedIn, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, newApptSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        let data = await Appointment.add(req.body)
        return res.status(201).send(data)
    } catch (error) {
        return next(error)
    }
})


// gets appointment by id 
// returns { username, name, dateStart, dateEnd, description, location, {forecast} }
// must be logged in and appointment creator
router.get("/:appt_id", ensureCorrectUser, async function(req, res, next) {
    try {
        let data = await Appointment.get(req.params.appt_id)
        const forecastRes = await Appointment.getApptForecasts(req.params.appt_id)
        if (forecastRes.rows) {
            data['forecast'] = forecastRes
        }
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})


// updates appointment 
// returns { username, name, dateStart, dateEnd, description, location }
// must be logged in and appointment creator
router.patch("/:appt_id", ensureCorrectUser, async function(req, res, next) {
    try {
        // remove empty string values so jsonschema doesn't throw errors
        for (let key in req.body) {
            if (req.body[key] == '') {
                delete req.body[key]
            } 
        }
        const validator = jsonschema.validate(req.body, updateApptSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        const data = await Appointment.update(req.params.appt_id, req.body)
        return res.json(data)
    
    } catch (error) {
        return next(error)
    }
})


//deletes appointment by id. Returns id and title
//must be logged in or appt creator
router.delete("/:appt_id", ensureCorrectUser, async function(req, res, next) {
    try {
        let deleted = await Appointment.remove(req.params.appt_id)
        return res.json({ deleted })
    } catch (error) {
        return next(error)
    }
})

/////////////////////// FORECAST ////////////////////////////////
// route to get all forecasts given appt id
router.get("/:appt_id/forecast", ensureLoggedIn, async function(req, res, next) {
    try {
        const data = await Appointment.getApptForecasts(req.params.appt_id)
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})


//route to add a forecast for the specific appt by id
router.post("/:appt_id/forecast", async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, newForecastSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        const data = await Forecast.add(req.params.appt_id, req.body)
        return res.status(201).send(data)
    } catch (error) {
        return next(error)
    }
})


//route to update a forecast by id for the specific appt by appt_id
router.patch("/:appt_id/forecast/:id", async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, updateForecastSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        const data = Forecast.update(req.params.appt_id, req.params.id, req.body)
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})

router.delete("/:appt_id/forecast", async function(req, res, next) {
    try {
        const data = Forecast.deleteAllForecasts(req.params.appt_id)
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})

module.exports = router;

