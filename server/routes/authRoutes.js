//  Authentication Routes
const express = require("express");

const router = express.Router();

// destructuring the register and login functions from the authController module
const {
    register,
    login
} = require("../controllers/authController");

// Register Route

router.post(
    "/register",
    register
);

// Login Route

router.post(
    "/login",
    login
);

module.exports = router;