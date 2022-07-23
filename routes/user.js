// USER ROUTES

const jsonschema = require("jsonschema");

const { authenticateJWT, ensureCorrectUser } = require("../middleware/auth")
const { createToken } = require("../helpers/tokens");
const { BadRequestError } = require("../expressError");
const express = require("express");
const User = require("../models/user");


//save new user in db. expects { username, password, email }
// * Returns JWT token which can be used to authenticate further requests.

router.post("/", async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, newUserSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const newUser = await User.register({ ...req.body });
      const token = createToken(newUser);
      return res.status(201).json({ token });
    } catch (err) {
      return next(err);
    }
  });
  


//get user by username
router.get("/:id", async function(req, res, next) {
    try {
        let results = await User.get(req.params.id)
        return res.send(results)
    } catch (error) {
        return next(error)
    }
})


//update user route




//delete user route
router.delete("/:id", ensureCorrectUser, async function(req, res, next) {
    try {
        let results = await User.remove(req.params.id)
        return res.json({ removed: results })
    } catch (error) {
        return next(error)
    }
})



const router = express.Router();
