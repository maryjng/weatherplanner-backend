const express = require("express");
const weatherApi = require("../models/weatherApi")
const Forecast = require("../models/forecasts")
const { NotFoundError } = require("../expressError");

const router = new express.Router();

//backend route for sending requests to third party weather api
// needs zipcode, tempUnit=fahrenheit
// can contain startDate and endDate, with which parseRequestForDb will be used instead to return forecast data for storing in db through the forecast model
router.post("/", async function(req, res, next) {
    try {
        console.log(req.body.data)
        let { tempUnit, zipcode } = req.body.data
        let data = await weatherApi.getForecast({ "tempUnit": tempUnit, "zipcode": zipcode})

        if (!data) throw new NotFoundError("Zipcode does not exist.")

        let result;
        //if start and end dates are given, organize data for inserting into db
        if (req.body.data.startDate) {
            result = weatherApi.parseRequestForDb(req.body.data.startDate, req.body.data.endDate, data)
        } else {
        //if no dates are given, organize data for display in frontend
            result = weatherApi.parseRequestForCalendar(data)
        }
        console.log(result)
        return res.send(result)
    } catch (error) {
        return next(error)
    }
})


module.exports = router;
