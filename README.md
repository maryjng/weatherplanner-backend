# weatherplanner Backend

API used: 
https://api.open-meteo.com/v1/forecast

See calendar-schema.sql for db schema. Each forecast row is for one day and multiple forecasts for one appointment are grouped together by the appt_id column.

## General Overview
This web application integrates weather forecasts based on zipcode with a typical calendar planner function to allow users to schedule their appointments based on predicted weather for the location. A one-week forecast (can be extended by paying the third party api provider) can be requested through submission of the zipcode form. Users can reference the forecast as they finalize their appointment details and submit the new appointment form. Forecasts are saved along with their connected appointment. The forecast information is called from a database and displayed whenever the user clicks on the event. Users will have an option to edit the appointment location and time or delete the appointment altogether.

### The entire application follows the usual Node.js/Express backend and React frontend approach. There is an api class (api.js) defined in the frontend that is responsible for sending requests to the backend. The backend may query the database and/or respond depending on the request.

# API Routes - There are four main routes - auth, users, appointments, weatherapi; Appointments has a subroute for forecasts of a specific appointment: appointments/:appt_id/forecast 

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
  ## APPOINTMENTS model contains functions for adding, updating, deleting, and getting individual and all appointments. There is also a getApptUser function that takes an appointment id and returns the username of its creator.
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
## Registration
      User submits the register form with a username, email, and password.
      Register component calls the register function from the api class. A POST request is sent to the backend route /auth/register, which adds the user to the database and returns a token.
             
## Login
      User submits the login form with a username and password.
      The Login component calls the login function from the api class. A GET request is sent to the backend route /auth/login, which returns a token if successful. The token is saved in the api class component as the class variable token. The React states currentUser, token, and allEvents are set using queried user information.
      
## Appointment Creation
      User submits the NewAppointmentForm. 
      The component calls the addAppt function from the api class. A POST request is sent to the backend route /appointments. 
      
      
      
