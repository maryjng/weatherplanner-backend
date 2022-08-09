const express = require("express");
const router = new express.Router();
const weatherApi = require("../models/weatherApi")
const Forecast = require("../models/forecasts")


//test backend route for sending requests to third party weather api
router.get("/", async function(req, res, next) {
    try {
        let data = await weatherApi.getForecast(latitude=40.41, longitude=-74.41)
        let result = weatherApi.parseRequestForDb("2022-08-10", "2022-08-11", data)
        let results = Forecast.add(1, result)
        return res.send(results)
    } catch (error) {
        return next(error)
    }
})


module.exports = router;
