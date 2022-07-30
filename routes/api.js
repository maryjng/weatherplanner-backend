//route to request data from weather api

import axios from "./axios";
const weatherApi = require("..models/weatherApi");
const { BadRequestError } = require("../expressError");
const { getLatAndLong } = require("../helpers/latLong")
const express = require("express");
const router = new express.Router();


// req body should be { zipcode, tempUnit, timezone }
// start date must be yyyy-mm-dd format
// returns data ready for use with Forecast model's functions
router.get("/", async function(req, res, next) {
    try {
        let { latitude, longitude } = getlatLong(req.body.zipcode)
        let rawResult = await weatherApi.getForecast(latitude, longitude, req.body)
        let result = weatherApi.parseRequestForCalendar(rawResult)
        return res.send(result)
    } catch (error) {
        return next(error)
    }
})


