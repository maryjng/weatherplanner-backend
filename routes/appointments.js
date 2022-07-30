const jsonschema = require("jsonschema");

const { BadRequestError } = require("../expressError");
const { ensureCorrectUser } = require("../middleware/auth")
const express = require("express");
const router = new express.Router();
const Appointment = require("../models/appointments");
const newApptSchema = require("../schemas/newApptSchema");
const updateApptSchema = require("../schemas/updateApptSchema");

// POST new appt in db. 
// Expects { name, dateStart, dateEnd, description} 
// returns { id, name, dateStart, dateEnd, description }
router.post("/", async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, newApptSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        let userId = res.locals.user
        let results = await Appointment.add(userId, req.body)
        return res.status(201).json(results)
    } catch (error) {
        return next(error)
    }
})


// GET appointment by id 
// returns { name, dateStart, dateEnd, description }
router.get("/:id", async function(req, res, next) {
    try {
        let appt = await Appointment.get(req.params.id)
        return res.send(appt)
    } catch (error) {
        return next(error)
    }
})


// PATCH appointment 
router.patch("/:id", ensureCorrectUser, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, updateApptSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        let result = await Appointment.update(req.params.id, req.body)
        return res.json({ result })
    } catch (error) {
        return next(error)
    }
})


//DELETE appointment
router.delete("/:id", ensureCorrectUser, async function(req, res, next) {
    try {
        await Appointment.delete(req.params.id)
        return res.json({ deleted: req.params.id })
    } catch (error) {
        return next(error)
    }
})


