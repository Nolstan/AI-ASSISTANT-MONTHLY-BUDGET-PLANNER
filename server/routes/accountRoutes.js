// Routes for user money operations
// Withdrawal, balance, transactions


const express = require("express");

const router = express.Router();



const auth =
require("../middleware/authMiddleware");


const {

    withdrawMoney,

    getBalance,

    getTransactions

}
= require("../controllers/accountController");



// Withdraw available money

router.post(

    "/withdraw",

    auth,

    withdrawMoney

);



// Get account balance

router.get(

    "/balance",

    auth,

    getBalance

);



// Get transaction history

router.get(

    "/transactions",

    auth,

    getTransactions

);



module.exports = router;