// Routes for user money operations
// Withdrawal, balance, transactions


const express = require("express");

const router = express.Router();


const auth =
require("../middleware/authMiddleware");


const {

    withdrawMoney

}
=
require("../controllers/accountController");



// Withdraw available money

router.post(

    "/withdraw",

    auth,

    withdrawMoney

);



module.exports = router;