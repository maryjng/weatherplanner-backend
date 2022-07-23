// MODEL FOR FORECAST STORING AND UPDATING IN DB

const db = require("../db");
const {
  NotFoundError,
  BadRequestError
} = require("../expressError");
const { getLatAndLong } = require("../helpers/latLong")
const { getForecast, parseRequestForCalendar, parseRequestForDb, WEATHERCODE } = require("../helpers/weatherApi")
 
 
 class Forecast {
 
//request to forecast api. Organizes result into data ready to save in db. 
// Takes { latitude, longitude, tempUnit, timezone, startDate, endDate }
// returns the same FOR THE DAY OF THE APPT ONLY
// start and end date must be yyyy-mm-dd format
    static async requestForecast(data) {
        let rawData = getForecast(data)
        let resData = parseRequestForDb(rawData)
        return resData
    }


 // stores a forecast. Takes (appt_id, { latitude, longitude, max_temp, min_temp,  weather_code }). 
    static async add(appt_id, data) {
        const { latitude, longitude, max_temp, min_temp, weather_code } = data
        const result = await db.query(
            `INSERT INTO forecast
            (appt_id, latitude, longitude, max_temp, min_temp, weather_code)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING appt_id, latitude, longitude, max_temp, min_temp, start_hour_temp, weather_code`, [appt_id, latitude, longitude, max_temp, min_temp, weather_code]
        )
        
        return result.rows[0]
    }


// updates a forecast. Takes (appt_id, { latitude, longitude, max_temp, min_temp,  weather_code }). 
// if appt_id does not exist throws a NotFoundError
    static async update(appt_id, data){
        const { latitude, longitude, max_temp, min_temp, weather_code } = data
        const result = await db.query(
            `UPDATE forecast
            SET ($1, $2, $3, $4, $5)
            WHERE appt_id=$6
            RETURNING appt_id, latitude, longitude, max_temp, min_temp, weather_code`, [latitude, longitude, max_temp, min_temp, weather_code, appt_id]
        )
        const forecast = result.rows[0]
        
        if (!forecast) throw new NotFoundError(`No appointment by ${appt_id} exists.`)

        return forecast;
    }
 }


 export default Forecast;