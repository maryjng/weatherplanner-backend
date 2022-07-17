import axios from "./axios";

BASE_URL = "https://api.open-meteo.com/v1/forecast"

class weatherApi {

    async getForecast(){
        let res = await axios.get(`${BASE_URL}?latitude=${latitude}&longitude=${longitude}hourly=temperature_2m,rain,showers,snowfall,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours&windspeed_unit=mph&precipitation_unit=inch&timezone=${timezone}`)

        res
    }

    parseRequest(data){
        
    }
}