// Budget Routes - are protected by the auth middleware, 
// which checks for a valid JWT token before allowing access.
// if we dont do this then anyone can access the budget routes without being logged in.



const express = require("express");

const router = express.Router();


const auth =
require("../middleware/authMiddleware");


const {

    createBudget,

    getBudgets,

    updateBudgetPlan,

    approveBudget

} = require("../controllers/budgetController");



// Create budget

router.post(

    "/",

    auth,

    createBudget

);



// Get user's budgets

router.get(

    "/",

    auth,

    getBudgets

);

// for modifying the budget plan
router.put(

    "/:id",
    auth,
    updateBudgetPlan
);


// Approve budget

router.post(

    "/:id/approve",

    auth,

    approveBudget

);
module.exports = router;