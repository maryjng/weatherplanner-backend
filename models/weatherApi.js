//HELPERS FOR REQUEST AND PARSE FUNCTIONS TO DO WITH FORECAST API 

const axios = require("axios")
const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { getTodayDate, getEndDate, getLatAndLong, dateToISO } = require("../helpers/api")

const BASE_URL = "https://api.open-meteo.com/v1/forecast"

// weathercodes for use with forecast api
const WEATHERCODE = {0: "clear skies", 1: "mainly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 48: "depositing rime fog", 51: "light drizzle", 53: "moderate drizzle", 55: "dense drizzle", 56: "light freezing drizzle", 57: "dense freezing drizzle", 61: "slight rain", 63: "moderate rain", 65: "heavy rain", 66: "light freezing rain", 67: "heavy freezing rain", 71: "slight snow fall", 73: "moderate snow fall", 75: "heavy snow fall", 77: "snow grains", 80: "slight rain showers", 81: "moderate rain showers", 82: "violent rain showers", 85: "slight snow showers", 86: "heavy snow showers", 95: "thunderstorm", 96: "thunderstorm with slight hail", 99: "thunderstorm with heavy hail"}


class weatherApi {
    //sends request to forecast API. Takes zipcode, tempUnit
    static async getForecast(data) {
        let { zipcode, tempUnit } = data
        // get latitude and longitude to pass to weather api request
        let { latitude, longitude } = await getLatAndLong(zipcode)

        //this because if celcius is desired unit the weather api actually requires the temperature_unit param be left out. temperature_unit=celcius causes an error. Really.
        let tempClause = ""
        if (tempUnit == "fahrenheit" || tempUnit == "Celcius") {
            tempClause = `temperature_unit=fahrenheit`
        }

        let res = await axios.get(`${BASE_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min&${tempClause}&timezone=auto`)

        return res.data;
    }

    // organizes response data from getForecast to be displayed in front end 
    //     expects response from getForecast as input
    //     returns {date: { weather, max, min, date, tempUnit}}
    static parseRequestForCalendar(data){
        let { daily } = data
        let forecast = {}

        // organizes data into weather, max_temp, min_temp, and date for each day in the data
        for (let x = 0; x < daily.time.length; x++) {
            let date = daily.time[x]
            let weather = WEATHERCODE[daily.weathercode[x]]
            forecast[date] = {
                "weather": weather, 
                "max_temp": daily.temperature_2m_max[x], 
                "min_temp": daily.temperature_2m_min[x], 
                "date": date,
                "tempUnit": data.daily_units.temperature_2m_max
            }
        }
        return forecast;
    }

    //** PLEASE CLEAN THIS UP */
    // organizes response from getForecast and returns data for use with Forecast model fns
    // start is a date object representing the start of the appointment 
    // end is the date object for end of appointment
    // expects data to include { latitude, longitude, daily: { time, weathercode, temperature_2m_max, temperature_2m_min }}
    // startDate and endDate must be yyyy-mm-dd
    // returns { date: { latitude, longitude, max_temp, min_temp, weathercode }} for whichever dates the appointment includes
    static parseRequestForDb(start, end, data){
        let { latitude, longitude, daily } = data
        //strip down to yyyy-mm-dd then convert to date to compare
        let currDate = new Date(start.slice(0, 10))
        end = new Date(end.slice(0, 10))

        //end date reflects one week forecast, which is the most the free weather api plan allows
        let endDate = new Date(getEndDate(8))
        let result = {}

        //if appt start date is beyond the one week forecast range, just return empty obj
        if (currDate.getTime() > endDate.getTime()) return result;

        //set endDate to whichever is sooner: the last day of the appointment (end) or the end of the one week forecast
        endDate = endDate < end ? endDate : end 

        // get the day of the week to start the loop
        let dayIdx = daily.time.indexOf(currDate)

        // pull info from data for each day of one week period
        while (currDate.getTime() < endDate.getTime()) {
            // console.log(currDate.getTime())
            let max_temp = daily.temperature_2m_max[dayIdx]
            let min_temp = daily.temperature_2m_min[dayIdx]
            let weathercode = data.daily.weathercode[dayIdx]
            let isoDate = dateToISO(currDate)

            result[isoDate] = {
                latitude: latitude,
                longitude: longitude,
                date: new Date(isoDate),
                max_temp: max_temp,
                min_temp: min_temp,
                weather: WEATHERCODE[weathercode]
            }
            dayIdx += 1
            currDate.setDate(currDate.getDate() + 1)
        }
        return result;
    }
}

module.exports = weatherApi;