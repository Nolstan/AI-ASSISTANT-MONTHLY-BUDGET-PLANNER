// this file holds the routes for locked budgets.



const express = require("express");

const router = express.Router();


const auth =
require("../middleware/authMiddleware");


const {
    lockBudget
}
=
require("../controllers/lockedBudgetController");



// Lock approved budget

router.post(

    "/:id/lock",

    auth,

    lockBudget

);



module.exports = router;