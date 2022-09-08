const express = require("express");
const router = new express.Router();
const weatherApi = require("../models/weatherApi")
const Forecast = require("../models/forecasts")
const { NotFoundError } = require("../expressError");


//backend route for sending requests to third party weather api
// needs zipcode, tempUnit=fahrenheit
router.get("/", async function(req, res, next) {
    try {
        let data = await weatherApi.getForecast(req.body)
        if (!data) throw new NotFoundError("Zipcode does not exist.")
        // latitude=40.41, longitude=-74.41 for test
        let result = weatherApi.parseRequestForDb(data)
        // let results = Forecast.add(1, result) 
        return res.send(result)
    } catch (error) {
        return next(error)
    }
})


module.exports = router;
