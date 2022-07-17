const jsonschema = require("jsonschema");

const { BadRequestError } = require("../expressError");
const express = require("express");
const Appointment = require("../models/appointments");
const router = new express.Router();

//save new appt in db. 
// Expects { name, dateStart, dateEnd, description} 
// returns { id, name, dateStart, dateEnd, description }
router.post("/", async function(req, res, next) {
    try {
        let results = await Appointment.add(req.body)
        return res.send(results)
    } catch (error) {
        return next(error)
    }
})


// gets appointment by id 
// returns { name, dateStart, dateEnd, description }
router.get("/:id", async function(req, res, next) {
    try {
        let appt = await Appointment.get(req.params.id)
        return res.send(appt)
    } catch (error) {
        return next(error)
    }
})


// updates appointment 
// ADD SQLFORPARTIALUPDATE AND COMPLETE THIS ***
router.update("/:id", async function(req, res, next) {
    try {
        let result = await Appointment.update()
    } catch (error) {
        return next(error)
    }
})


//deletes appointment
router.delete("/:id", async function(req, res, next) {
    try {
        let result = await Appointment.delete(req.params.id)
        return res.send(result)
    } catch (error) {
        return next(error)
    }
})


module.exports = router;

