// USER ROUTES

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const User = require("../models/user");

const { ensureCorrectUser } = require("../middleware/auth")

const router = new express.Router();

//save new user in db. expects { username, password, email }
router.post("/", async function (req, res, next) {
    try {
        let user = await User.register(req.body)
        const token = createToken(user);
        return res.status(201).json({ user, token });
        } catch (error) {
       return next(error)
    }
})


//get user by username
// ADD USER APPOINTMENTS IN RES TOO ***
router.get("/:username", ensureCorrectUser, async function(req, res, next) {
    try {
        let results = await User.get(req.params.username)
        return res.send(results)
    } catch (error) {
        return next(error)
    }
})


//update user route



//delete user route



module.exports = router;