//  AI Routes

const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
    generatePlan
} = require("../controllers/aiController");


router.post(

    "/generate/:budgetId",

    auth,

    generatePlan

);

module.exports = router;