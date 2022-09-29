const db = require("../db");

// takes zipcode and returns latitude and longitude for weather api request use
async function getLatAndLong(zipcode) {
    let leading_zeroes = 0
    
    if (zipcode[0] == 0 && zipcode[1] == 0) {
        leading_zeroes = 2
    } else if (zipcode[0] == 0) {
        leading_zeroes = 1
    }

    let res = await db.query(
        `SELECT latitude, longitude
        FROM zipcodes
        WHERE zipcode=$1 and leading_zeroes=$2
        `, [zipcode, leading_zeroes]
    );
    let result = res.rows[0]
    if (!result) return false;
    return result;
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

