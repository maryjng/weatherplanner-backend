const axios = require("axios")
const apiKey = ""

// takes zipcode and returns latitude and longitude for weather api request use

async function getLatAndLong(zipcode) {
    let res = await axios.get(`https://thezipcodes.com/api/v1/search?zipCode=${zipcode}countryCode=US&apiKey=${apiKey}`)
    let { latitude, longitude } = res.location
    return {latitude: latitude, longitude: longitude}
}

function getTodayDate() {
    var dtObj = new Date();
    var day = ("0" + dtObj.getDate()).slice(-2);
    var month = ("0" + (dtObj.getMonth() + 1)).slice(-2);
    var year = dtObj.getFullYear()
    var date = year + "-" + month + "-" + day;
    return date;
}

function getEndDate() {
    var today = new Date()
    let dtObj = today.setDate(today.getDate() + 6)
    var day = ("0" + dtObj.getDate()).slice(-2);
    var month = ("0" + (dtObj.getMonth() + 1)).slice(-2);
    var year = dtObj.getFullYear()
    var date = year + "-" + month + "-" + day;
    return date;
}

module.exports = { getLatAndLong, getTodayDate, getEndDate, WEATHERCODE };


// https://thezipcodes.com/docs