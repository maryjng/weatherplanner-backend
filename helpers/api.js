const axios = require("axios")
const apiKey = "3ba4d84d05d3de845562ec6fad5dbd2c"

// takes zipcode and returns latitude and longitude for weather api request use

async function getLatAndLong(zipcode) {
    let res = await axios.get(`https://thezipcodes.com/api/v1/search?zipCode=${zipcode}countryCode=US&apiKey=${apiKey}`)
    let { latitude, longitude } = res.location
    return {latitude: latitude, longitude: longitude }
}


//date is a date object. This returns yyyy-mm-dd from it
function dateToISO(dtObj) {
    let date = dtObj.toISOString().slice(0, 10)
    return date;
}

function getTodayDate() {
    var dtObj = new Date();
    var day = ("0" + dtObj.getDate()).slice(-2);
    var month = ("0" + (dtObj.getMonth() + 1)).slice(-2);
    var year = dtObj.getFullYear()
    var date = year + "-" + month + "-" + day;
    return date;
}

function getEndDate(days) {
    var today = new Date()
    var dtObj = new Date()
    dtObj.setDate(today.getDate() + days)
    var day = ("0" + dtObj.getDate()).slice(-2);
    var month = ("0" + (dtObj.getMonth() + 1)).slice(-2);
    var year = dtObj.getFullYear()
    var date = year + "-" + month + "-" + day;
    return date;
}

module.exports = { getLatAndLong, getTodayDate, getEndDate, dateToISO };


// https://thezipcodes.com/docs
