// This file holds the routes for locked budgets.

const express = require("express");

const router = express.Router();

const auth =
require("../middleware/authMiddleware");


const {
    lockBudget
}
=
require("../controllers/lockedBudgetController");


const {

    getLockedBudget,

    getAvailableMoney,

    getUpcomingReleases

}
=
require("../controllers/lockedBudgetViewController");



// Lock an approved budget
// POST /api/locked-budget/:id/lock


router.post(

    "/:id/lock",

    auth,

    lockBudget

);




// View users locked budget


router.get(

    "/",

    auth,

    getLockedBudget

);




// View released money


router.get(

    "/available",

    auth,

    getAvailableMoney

);




// View upcoming releases


router.get(

    "/upcoming",

    auth,

    getUpcomingReleases

);



module.exports = router;