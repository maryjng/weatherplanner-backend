// USER ROUTES

const jsonschema = require("jsonschema");
const express = require("express");
const { createToken } = require("../helpers/tokens")

const { BadRequestError } = require("../expressError");
const User = require("../models/user");

const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth")

const NewUserSchema = require("../schemas/newUser")
const UserUpdateSchema = require("../schemas/updateUser")

const router = new express.Router();

//save new user in db. expects { username, password, email }
router.post("/", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, NewUserSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        let user = await User.register(req.body)
        const token = createToken(user);
        return res.status(201).json({ user, token });
        } catch (error) {
       return next(error)
    }
})


//get user by username. Response includes all user appts
// requires logged-in user to be the same as requested user
router.get("/:username", ensureCorrectUser, async function(req, res, next) {
    try {
        let results = await User.get(req.params.username)
        return res.send(results)
    } catch (error) {
        return next(error)
    }
})

//removed ensureCorrectUser for now
router.patch("/:username", ensureLoggedIn, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, UserUpdateSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }

        await User.authenticate(req.params.username, req.body.currPassword)
        //current password not needed after authentication
        delete req.body.currPassword

        let results = await User.updateUser(req.params.username, req.body)
        return res.json({"updated": results})
    } catch(error) {
        return next(error)
    }
})

module.exports = router;