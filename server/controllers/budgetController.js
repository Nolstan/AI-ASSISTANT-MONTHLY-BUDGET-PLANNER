
// This file Handles:

// Creating budgets
// Viewing user budgets



const Budget = require("../models/Budget");



// Create Budget


exports.createBudget = async(req,res)=>{


    try{


        const {

            monthlyAmount,

            expenses

        } = req.body;



        const budget = await Budget.create({

            user:req.user.id,

            monthlyAmount,

            expenses

        });



        res.status(201).json({

            message:"Budget created successfully",

            budget

        });



    }catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};





// Get User Budgets


exports.getBudgets = async(req,res)=>{


    try{


        const budgets = await Budget.find({

            user:req.user.id

        });



        res.json({

            budgets

        });



    }catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};



//   Allows the user to modify the AI generated budget.
//   Before saving, we verify that the total matches
//   the original monthly budget.


exports.updateBudgetPlan = async (req, res) => {

    try {

        const {
            recommendedBudget
        } = req.body;


        // Find budget belonging to logged in user
        const budget = await Budget.findOne({

            _id: req.params.id,

            user: req.user.id

        });


        if (!budget) {

            return res.status(404).json({

                message: "Budget not found"

            });

        }


        // Calculate edited budget total
        const total = recommendedBudget.reduce(

            (sum, item) => sum + item.amount,

            0

        );


        // Prevent user from exceeding monthly limit
        if (total !== budget.monthlyAmount) {

            return res.status(400).json({

                message:
                `Budget must equal MWK ${budget.monthlyAmount}. Current total is MWK ${total}`

            });

        }


        // Update AI plan recommendations
        budget.aiPlan.recommendedBudget =
            recommendedBudget;


        await budget.save();


        res.json({

            message:
            "Budget plan updated successfully",

            aiPlan:
            budget.aiPlan

        });


    } catch(error) {


        console.error(error);


        res.status(500).json({

            message:error.message

        });


    }

};