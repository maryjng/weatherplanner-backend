const axios = require("axios")
const apiKey = ""

// weathercodes for use with forecast api
const WEATHERCODE = {0: "clear skies", 1: "mainly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 48: "depositing rime fog", 51: "light drizzle", 53: "moderate drizzle", 55: "dense drizzle", 56: "light freezing drizzle", 57: "dense freezing drizzle", 61: "slight rain", 63: "moderate rain", 65: "heavy rain", 66: "light freezing rain", 67: "heavy freezing rain", 71: "slight snow fall", 73: "moderate snow fall", 75: "heavy snow fall", 77: "snow grains", 80: "slight rain showers", 81: "moderate rain showers", 82: "violent rain showers", 85: "slight snow showers", 86: "heavy snow showers", 95: "thunderstorm", 96: "thunderstorm with slight hail", 99: "thunderstorm with heavy hail"}


// takes zipcode and returns latitude and longitude for weather api request use

async function getLatAndLong(zipcode) {
    let res = await axios.get(`https://thezipcodes.com/api/v1/search?zipCode=${zipcode}countryCode=US&apiKey=${apiKey}`)
    let { latitude, longitude } = res.location
    return {latitude: latitude, longitude: longitude}
}

module.exports = { getLatAndLong, WEATHERCODE };


// https://thezipcodes.com/docs