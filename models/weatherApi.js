//HELPERS FOR REQUEST AND PARSE FUNCTIONS TO DO WITH FORECAST API 

const axios = require("axios");
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
        let { zipcode } = data

        // get latitude and longitude to pass to weather api request
        let { latitude, longitude } = await getLatAndLong(zipcode)

        let res = await axios.get(`${BASE_URL}?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`)

        return res.data;
    }

    // organizes response data from getForecast to be displayed in front end 
    //     expects response from getForecast as input
    //     returns {date: { weather, max, min, date, tempUnit}}
    static parseRequestForCalendar(data){
        let { daily } = data
        let forecast = {}

        // organizes data into weather, max_temp, min_temp, and date for each day in the date
        // note that date has to have "00:00:00" added or it will be read as the day before.......
        for (let x = 0; x < daily.time.length; x++) {
            let date = daily.time[x]
            let weather = WEATHERCODE[daily.weathercode[x]]
            forecast[date] = {
                "weather": weather, 
                "max_temp": daily.temperature_2m_max[x], 
                "min_temp": daily.temperature_2m_min[x], 
                "date": (date + " 00:00:00"),
                "tempUnit": data.daily_units.temperature_2m_max
            }
        }
        return forecast;
    }

    // organizes response from getForecast and returns data for use with Forecast model fns
    // start is a date object representing the start of the appointment 
    // end is the date object for end of appointment
    // expects data to include { latitude, longitude, daily: { time, weathercode, temperature_2m_max, temperature_2m_min }}
    // startDate and endDate are expected to be strings like yyyy-mm-ddThh:mm:ss.sss
    // returns { date: { latitude, longitude, max_temp, min_temp, weathercode }} for whichever dates the appointment includes
    static parseRequestForDb(start, end, data){ 
        let { latitude, longitude, daily } = data
        let result = {}

        //convert start and end strings to Dates for comparison
        end = new Date(end)
        start = new Date(start)
        //compare today and start date and set the more recent one as the start of the forecast result loop
        let today = new Date()
        let currDate = start.getTime() < today.getTime() ? today : start

        //end date reflects one week forecast, which is the most the free weather api plan allows
        //compare last day of appointment with one week from today and set endDate as whichever is sooner
        let endDate = new Date(getEndDate(7))
        endDate = endDate > end ? end : endDate

        //if appt start date is beyond the one week forecast range, just return empty obj
        if (start.getTime() > endDate.getTime()) return result;
        //same for if appt end date is before currDate
        if (currDate.getTime() > end.getTime()) return result;

     //BUILDING THE FORECAST RESULTS
        // get the day of the week to start the loop (data goes by yyyy-mm-dd date format, hence slice)
        let dayIdx = daily.time.indexOf(currDate.toISOString().slice(0, 10))

        // pull info from data for each day of one week period
        while (currDate.getTime() < endDate.getTime()) {
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