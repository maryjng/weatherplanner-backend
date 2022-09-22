# weatherplanner Backend

API used: 
https://api.open-meteo.com/v1/forecast

See calendar-schema.sql for db schema. Each forecast row is for one day and multiple forecasts for one appointment are grouped together by the appt_id column.

# General Overview
This web application integrates weather forecasts based on zipcode with a typical calendar planner function to allow users to schedule their appointments based on predicted weather for the location. A one-week forecast (can be extended by paying the third party api provider) can be requested through submission of the zipcode form. Users can reference the forecast as they finalize their appointment details and submit the new appointment form. Forecasts are saved along with their connected appointment. The forecast information is called from a database and displayed whenever the user clicks on the event. Users will have an option to edit the appointment location and time or delete the appointment altogether.

The entire application follows the usual Node.js/Express backend and React frontend approach. There is an api class (api.js) defined in the frontend that is responsible for sending requests to the backend. Backend routes will call functions from models (in models folder) and may query the database and respond depending on the request.

# BACKEND API Routes - There are four main routes - auth, users, appointments, weatherapi; 
### Appointments has a subroute for forecasts of a specific appointment: appointments/:appt_id/forecast 

##  AUTH - The auth route is handles token generation and user registration.
      POST /auth/token:  { username, password } => { token }
      - Returns JWT token which can be used to authenticate further requests.
    
      POST /auth/register:   { user } => { token }
       where user must include { username, password, firstName, lastName, email }
        - Returns JWT token which can be used to authenticate further requests.

##  USERS - This route handles user get requests
      GET /users/:username: queries db for user by username. 
        - Response includes all user appointments, if any.
        - Requires logged-in user to be the same as requested user
    
## APPOINTMENTS - This route handles appointment creation, deletion, editing, and get requests
      POST /appointments: save new appt in db. 
        - Expects { username, name, dateStart, dateEnd, description, location} 
        - Returns { id, username, name, dateStart, dateEnd, description, location }
        - Must be logged in
    
      GET /appointments/:id: gets appointment by id 
        - Returns { username, name, dateStart, dateEnd, description, location, {forecast} }
        - Must be logged in
    
     PATCH /appointments/:id: updates appointment 
        - Returns { username, name, dateStart, dateEnd, description, location }
        - Must be appointment creator
    
###  APPOINTMENTS/FORECAST - SUBROUTE FOR APPOINTMENTS. Handles creation, deletion, editing, and get requests for forecasts of a specific appointment
      GET /appointments/:appt_id/forecast: route to get all forecasts given appt id
      POST /appointments/:appt_id: route to add a forecast for the specific appt by id
      PATCH /appointments/:appt_id/forecast/:id : route to update a forecast by id for the specific appt by appt_id
    
## WEATHERAPI - This route is to handle requests for forecasts from the third party weather API.
      GET /weatherapi
        - request body should have { zipcode, tempUnit }

# MODELS are divided into appointments, forecasts, user, & weatherapi
APPOINTMENTS model contains functions for adding, updating, deleting, and getting individual and all appointments. There is also a getApptUser function that takes an appointment id and returns the username of its creator.
      
      add(data): 
       - where data is { username, title, startDate, endDate, description, location } 
       - returns { id, username, title, startDate, endDate, description, location }
 
      get(id): 
      - where id is the appointment id
      - returns { id, username, title, startDate, endDate, description, location } 
      - throws NotFoundError if id does not exist
 
      update(id, data):
      - where id is the appointment id and data can contain { username, title, startDate, endDate, description, location }
      - utilizes the sqlForPartialUpdate helper function to update whichever valid values are passed in through data param
      - throws NotFoundError if id does not exist

      remove(id):
      - where id is the appointment id
      - returns appointment name
       - throws NotFoundError if id does not exist

      getApptForecasts(id):
      - where id is the appointment id
      - returns all forecasts for the appointment like [{forecast}, {forecast}, {forecast}...]
      - throws NotFoundError if id does not exist

      ###getApptUser(id):
      - where id is the appointment id
      - returns the username of the appointment creator
      - throws NotFoundError if id does not exist
       - basically used as part of the auth middleware to check if the current user is authorized

## FORECAST - contains functions for adding, updating, deleting, and getting individual or all forecasts.
      add(appt_id, data)
      - where appt_id is the appointment id and data is { latitude, longitude, date, max_temp, min_temp, weathercode }
      - this function is meant to take the results of the weatherApi.parseRequestForDb function. 
      - returns { appt_id, latitude, longitude, date, max_temp, min_temp, weathercode }
      - throws NotFoundError if appt_id does not exist

      update(appt_id, id, data)
      - where appt_id is the appointment id, id is the forecast id, and data can include { max_temp, min_temp, weathercode }
      - returns { appt_id, date, max_temp, min_temp, weathercode }
      - throws NotFoundError if appt_id or id does not exist

## USER - functions for authenticating, registering, getting, and removing users
      authenticate(username, password)
      - checks database to see if username/password matches
      - returns user query result
      - throws UnauthorizedError if check fails

      register(data) - data is { username, password, email }
      - registers user. Checks if the username already exists
      - throws BadRequestError if duplicate is found

      get(username)
      - gets user by username
      - returns { id, title, startDate, endDate, description, location, { appointments } }
      - throws NotFoundError if user does not exist

      **remove(username)**
      - deletes user by username
      - returns username
      - throws NotFoundError if user does not exist

# USER FLOW
User actions and the step-by-step calling of functions are displayed here. In general, a form is submitted and the weatherApi class (api.js) in the frontend handles request sending to the backend. The backend route calls the appropriate model function(s) to query the db and manipulate data, which is sent back to the frontend as a response. Components are updated as needed according to the response.

## Registration ** NEED UPDATE **
      User submits the register form with a username, email, and password.
      Register component calls the register function from the api class. A POST request is sent to the backend route /auth/register, which adds the user to the database and returns a token.
             
## Login ** NEED UPDATE **
      User submits the login form with a username and password.
      The Login component calls the login function from the api class. A GET request is sent to the backend route /auth/login, which returns a token if successful. The token is saved in the api class component as the class variable token. The React states currentUser, token, and allEvents are set using queried user information.
      Users can now view and edit their Profile (at this point just an email change) and view and change their appointments.
      
## Getting Forecasts
      Before submitting the NewAppointmentForm, the user needs to get the forecast by submitting the ZipcodeForm. This will fetch forecast data for the given zipcode and set the displayForecast state while also showing forecast results to the user through the ForecastCalendar component. Users can then submit the NewAppointmentForm, deciding on the date and location by first viewing the forecasts. 
      > User submits the ZipcodeForm
      > -> form submission calls weatherApi.getForecast()
      > -> sends GET request to route /weatherapi
      > -> backend sends request to third party weather api for forecast data; weatherapi MODEL function handles this with getForecast and parseForecastForCalendar
      > -> response containing forecast is sent to frontend
      > -> React displayForecast state is updated with forecast info
      > User will use this forecast to help determine when and where to set the appointment
      
## Appointment Creation
      User submits the NewAppointmentForm. 
      The component calls the addAppt function from the api class. A POST request is sent to the backend route /appointments with the form data and forecast data for the appointment period. The addAppt function from the appointments MODEL is called along with the addForecast function from the forecast MODEL.
      The appointment and forecasts are saved to the database. 
      The appointment is now displayed on the main calendar whenever the user is logged in.
      
      > User submits NewAppointmentForm
      > -> form submission calls weatherApi.addAppt()
      > -> sends POST request to route /appointments
      > -> appointment MODEL addAppt() runs; data saved to db
      > -> forecast MODEL addForecast() runs; data saved to db
      > -> response containing appointment data sent back to frontend
      > -> React allEvents state is updated with new appointment
      > -> <Calendar /> displays new appointment
      
## Viewing Appointment Details / Deleting Appointment
      The user can click on an appointment, which will call the getForecasts function from the api class. This sends a GET request to the backend route /appointments/:appt_id, and the resulting appointment and forecast details are displayed on the page. Users will be able to change the appointment details by submitting a form. They can also delete the appointment by clicking "Delete Appointment".
      
     > User clicks on event on <Calendar /> 
     > -> <Calendar /> onClick function runs
     > -> weatherApi.getAppt runs 
     > -> sends GET request to route /appointments/:appt_id 
     > -> appointment MODEL getAppt() runs 
     > -> response containing appointment and forecast data sent back to frontend 
     > -> React displayForecast state is updated 
     > -> <ForecastCalendar /> component updates forecast state 
     > -> forecast and event info are displayed to user
      
## Editing Appointment - *** NEED UPDATE ***

      
      
      
