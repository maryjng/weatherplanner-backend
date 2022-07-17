// USER ROUTES

const jsonschema = require("jsonschema");

const { BadRequestError } = require("../expressError");
const express = require("express");
const User = require("../models/user");


//save new user in db. expects { username, password, email }
router.post("/", async function (req, res, next) {
    try {
        let { username, password, email } = req.body
        let results = await User.register(username, password, email)
        return res.send(results)
    } catch (error) {
       return next(error)
    }
})


//get user by username
// ADD USER APPOINTMENTS IN RES TOO ***
router.get("/:username", async function(req, res, next) {
    try {
        let username = req.params.username
        let results = await User.get(username)
        return res.send(results)
    } catch (error) {
        return next(error)
    }
})


//update user route



//delete user route



const router = express.Router();
