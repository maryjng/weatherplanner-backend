//HELPERS FOR REQUEST AND PARSE FUNCTIONS TO DO WITH FORECAST API 

import axios from "./axios";
const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { getTodayDate, getEndDate } = require("../helpers/latLong")

const BASE_URL = "https://api.open-meteo.com/v1/forecast"

// weathercodes for use with forecast api
const WEATHERCODE = {0: "clear skies", 1: "mainly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 48: "depositing rime fog", 51: "light drizzle", 53: "moderate drizzle", 55: "dense drizzle", 56: "light freezing drizzle", 57: "dense freezing drizzle", 61: "slight rain", 63: "moderate rain", 65: "heavy rain", 66: "light freezing rain", 67: "heavy freezing rain", 71: "slight snow fall", 73: "moderate snow fall", 75: "heavy snow fall", 77: "snow grains", 80: "slight rain showers", 81: "moderate rain showers", 82: "violent rain showers", 85: "slight snow showers", 86: "heavy snow showers", 95: "thunderstorm", 96: "thunderstorm with slight hail", 99: "thunderstorm with heavy hail"}


class weatherApi {
    //sends request to forecast API. Takes latitude, longitude { tempUnit, timezone }
    // start date must be yyyy-mm-dd format
    static async getForecast(latitude, longitude, { data }) {
        const { latitude, longitude, tempUnit, timezone } = data
        const startDate = getTodayDate()
        const endDate = getEndDate()
        let res = await axios.get(`${BASE_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min, precipitation_hours&temperature_unit=${tempUnit}&timezone=
        America%2FNew_York&start_date=${startDate}&end_date=${endDate})`)

        return res;
    }

    // organizes response data from getForecast to be displayed in front end 
    //     expects response from getForecast as input
    //     returns { latitude, longitude, daily: 
    //        time: { weather, max, min, precipitation_hour }
    //      }
    static parseRequestForCalendar(data){
        let { latitude, longitude, daily } = data
        let results = { latitude: latitude, longitude: longitude }

        for (let x = 0; x < daily.time.length; x++) {
            let day = []
            let weather = WEATHERCODE[daily.weathercode[x]]
            day.push( 
                weather, 
                daily.temperature_2m_max[x], 
                daily.temperature_2m_min[x], 
                daily.precipitation_hours[x]
                )
            results.daily[daily.time[x]] = day
        }
        return results;
    }

    // organizes response from getForecast and returns data for use with Forecast model fns
    // expects data to include startDate, { latitude, longitude, daily: { time, weathercode, temperature_2m_max, temperature_2m_min }}
    // startDate must be yyyy-mm-dd
    // returns the same FOR THE DAY OF THE APPT ONLY
    static async parseRequestForDb(startDate, data){
        let { latitude, longitude, daily } = data
        let dayIdx = daily.time.indexOf(startDate)

        let max_temp = data.daily.temperature_2m_max[dayIdx]
        let min_temp = data.daily.temperature_2m_min[dayIdx]
        let weather_code = data.daily.weathercode[dayIdx]

        let forecastForDb = {
            latitude: latitude,
            longitude: longitude,
            max_temp: max_temp,
            min_temp: min_temp,
            weather_code: weather_code
        }

        return forecastForDb;
    }

}


module.exports = { weatherApi, WEATHERCODE }