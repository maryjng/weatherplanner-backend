const express = require("express");
const weatherApi = require("../models/weatherApi")
const Forecast = require("../models/forecasts")
const { NotFoundError } = require("../expressError");

const router = new express.Router();

//backend route for sending requests to third party weather api
// needs zipcode, tempUnit=fahrenheit
router.get("/", async function(req, res, next) {
    try {
        console.log(`weatherapi: ${JSON.stringify(req.body)}`)
        let data = await weatherApi.getForecast(req.body)
        // if (!data) throw new NotFoundError("Zipcode does not exist.")
        // let result = weatherApi.parseRequestForDb(data)
        let result = weatherApi.parseRequestForCalendar(data)
        console.log(result)
        return res.send(result)
    } catch (error) {
        return next(error)
    }
})


module.exports = router;
