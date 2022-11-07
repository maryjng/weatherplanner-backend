# weatherplanner Backend

See https://github.com/maryjng/weatherplanner-frontend/blob/main/README.md for project requirements.

API used: 
https://api.open-meteo.com/v1/forecast

See calendar-schema.sql for db schema. Each forecast row is for one day and multiple forecasts for one appointment are grouped together by the appt_id column.


Table of Contents

[Routes]https://github.com/maryjng/weatherplanner-backend/blob/main/README.md#backend-api-routes---there-are-four-main-routes---auth-users-appointments-weatherapi

[Models]https://github.com/maryjng/weatherplanner-backend/blob/main/README.md#models-are-divided-into-appointments-forecasts-user--weatherapi

User Flow
[Registration]https://github.com/maryjng/weatherplanner-backend/blob/main/README.md#registration
[Login]https://github.com/maryjng/weatherplanner-backend/blob/main/README.md#login
[Edit Profile]https://github.com/maryjng/weatherplanner-backend/blob/main/README.md#edit-profile
[Getting Forecasts]https://github.com/maryjng/weatherplanner-backend/blob/main/README.md#getting-forecasts
[Viewing and Deleting Appointments]https://github.com/maryjng/weatherplanner-backend/blob/main/README.md#viewing-appointment-details--deleting-appointment
[Editing Appointments]https://github.com/maryjng/weatherplanner-backend/blob/main/README.md#editing-appointment

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

      **remove(username)** (CURRENTLY NOT IMPLEMENTED)
      - deletes user by username
      - returns username
      - throws NotFoundError if user does not exist

# USER FLOW
User actions and the step-by-step calling of functions are displayed here. In general, a form is submitted and the weatherApi class (api.js) in the frontend handles request sending to the backend. The backend route calls the appropriate model function(s) to query the db and manipulate data, which is sent back to the frontend as a response. Components are updated as needed according to the response.

## Registration 
![image](https://user-images.githubusercontent.com/68235230/196733762-564b6eda-e456-4a97-b68c-13c8c8ce9c29.png)
User submits the register form with a username, email, and password. All fields are required. Username must be a string of 5 to 30 chars. Password must be a string of 5 to 20 chars. Email must fit the email format and be 6 to 60 chars.

      > Register component calls the register function from the api class. A POST request is sent to the backend route /auth/register, which adds the user to the database and returns a token.
      > The token and currentUser states are updated in the frontend and stored in UserContext for other components to access      
            
## Login 
![image](https://user-images.githubusercontent.com/68235230/196733572-f32625c0-3808-475c-91a9-56323f21c53b.png)
User submits the login form with a username and password. All backend requests except registration require a token. If trying to access the route /calendar/view while not logged in, the page will redirect to /login. 

      > The Login component calls the login function from the api class. A GET request is sent to the backend route /auth/login, which returns a token if successful. 
      > The token is saved in the api class component as the class variable token. The React states currentUser, token, and allEvents are set using queried user information.
      > Users can now view and edit their Profile and view and change their appointments.
      > User is redirected to calendar upon success.
      > IF login fails, user is not redirected and will remain on /login.
      
## Edit Profile
![image](https://user-images.githubusercontent.com/68235230/196733638-2afbe52c-605d-46c1-97e5-5ebfdf086fa7.png)
User submits EditProfileForm. The form can contain either a new email or password and will always require the current password to successfully change info. The new password would also have to be entered in two different fields for confirmation.

      > On the frontend, if the new password fields are filled, they must match or an error is thrown. The email field is also verified here, if filled. An object is constructed with {currPassword, username} and can contain {email, password}. Username is taken from the currentUser state.
      > PATCH to backend route /users/:username
      > jsonschema validates the data
      > current password is authenticated using User.authenticate(). If successful, username and currPassword are deleted and the rest of the data is passed to User MODEL updateUser
      > JSON {"Updated": updateddata} is returned to frontend
      
## Getting Forecasts
Before submitting the NewAppointmentForm, the user may opt to first get the forecast by submitting the ZipcodeForm. This will fetch forecast data for the given zipcode and set the displayForecast state while also showing forecast results to the user through the ForecastCalendar component. Users can then submit the NewAppointmentForm, deciding on the date and location by first viewing the forecasts. 

      > User submits the ZipcodeForm
      > form submission calls weatherApi.getForecast()
      > sends GET request to route /weatherapi
      > backend sends request to third party weather api for forecast data; weatherapi MODEL function handles this with getForecast and parseForecastForCalendar
      > response containing forecast is sent to frontend
      > React displayForecast state is updated with forecast info
      > User will use this forecast to help determine when and where to set the appointment
      > Users can swap between viewing F and C temperature units by clicking the F/C link.
      > Whenever the submit button is clicked, the temperature unit reverts back to fahrenheit.
      
      
## Appointment Creation
<img width="1440" alt="image" src="https://user-images.githubusercontent.com/68235230/199905147-93f8e88e-9d85-4b82-915f-0126084dd19f.png">
User submits the NewAppointmentForm. 
      
      > User submits NewAppointmentForm
      > form submission calls weatherApi.addAppt()
      > sends POST request to route /appointments
      > appointment MODEL addAppt() runs; data saved to db
      > the appointment id is returned to the frontend
      > the form's zipcode, startdate, and enddate fields are sent in a POST request to /weatherapi
      > /weatherapi makes a request to the third party api and returns the data, organized by date. The frontend receives the data.
      > Each date's data is sent to backend POST /appointments/id/forecast
      > forecast MODEL addForecast() runs; data saved to db
      > response containing appointment data sent back to frontend
      > React allEvents state is updated with new appointment
      > <Calendar /> displays new appointment
      
## Viewing Appointment Details / Deleting Appointment

<img width="1440" alt="image" src="https://user-images.githubusercontent.com/68235230/199905208-d78bbc68-9c9d-4aa6-a977-b7d9a534b148.png">
The user can click on an appointment, which will call the getForecasts function from the api class. This sends a GET request to the backend route /appointments/:appt_id, and the resulting appointment and forecast details are displayed on the page. Users will be able to change the appointment details by submitting a form. They can also delete the appointment by clicking "Delete Appointment".
![image](https://user-images.githubusercontent.com/68235230/196733902-9fe5a84d-d382-42d3-9ecb-1c5a452a19f9.png)
      
     > User clicks on event on <Calendar /> 
     > <Calendar /> onClick function runs
     > weatherApi.getAppt runs 
     > sends GET request to route /appointments/:appt_id 
     > appointment MODEL getAppt() runs 
     > response containing appointment and forecast data sent back to frontend 
     > React displayForecast state is updated 
     > <ForecastCalendar /> component updates forecast state 
     > forecast and event info are displayed to user
     > Users can swap between viewing F and C temperature units by clicking the F/C link.
  
###   Users can also click "Update Forecast" when viewing an appointment's details to get the most updated forecast.
     
## Editing Appointment 
After clicking on an appointment on the Calendar, an edit button can be clicked. The EditApptForm will appear and users can submit it with at least one field filled to update the appointment. 

      > User submits the EditApptForm
      > A regex check for the zipcode field runs
      > the PATCH request is sent to route /appointments/:appt_id
      > appointment MODEL updateAppt() runs
      > updateAppt() makes sure the start and end dates (if any) make sense (that start date is not after end date). This includes if only one is updated - the other is queried from db for comparison.
      > appointment info (all fields) is sent back to frontend as response
      > allEvents state is updated
      > apptDetails (currently selected event) state is updated
      > the forecast display's temperature unit is set back to fahrenheit (fahrenheit state is set back to true)
      > apptDetails update triggers a useEffect, which updates the apptForecast state so that the displayed forecast matches the updated appointment dates

      
      
      
