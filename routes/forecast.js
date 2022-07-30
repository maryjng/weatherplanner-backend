//FORECAST ROUTES

const { BadRequestError } = require("../expressError");
const { ensureCorrectUser } = require("../middleware/auth")
const express = require("express");
const router = new express.Router();
const Forecast = require("../models/forecast");



// POST new forecast in db.
// request body should have { latitude, longitude, max_temp, min_temp, weather_code }
router.post("/:appt_id", async function(req, res, next) {
    try {
        let appt_id = req.params.appt_id       
        let results = await Forecast.add(appt_id, req.body)
        return res.status(201).json(results)
    } catch (error) {
        return next(error)
    }
})


// PATCH forecast
router.patch("/:appt_id", async function(req, res, next) {
    try {
        let appt_id = req.params.appt_id
        let result = await Appointment.update(appt_id, req.body)
        return res.json({ result })
    } catch (error) {
        return next(error)
    }
})




module.exports = router;

