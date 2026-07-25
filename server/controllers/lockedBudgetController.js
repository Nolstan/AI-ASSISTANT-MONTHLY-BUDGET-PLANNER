
//  This file Converts an approved budget into a locked budget.
//  The users money is divided into scheduled releases and ofcourse with a cronjob.
 


const Budget = require("../models/Budget");

const LockedBudget = require("../models/LockedBudget");



exports.lockBudget = async (req, res) => {


    try {


        // Find user's approved budget
        const budget = await Budget.findOne({

            _id:req.params.id,

            user:req.user.id

        });



        if(!budget){

            return res.status(404).json({

                message:"Budget not found"

            });

        }



        // Only approved budgets can be locked

        if(budget.status !== "approved"){


            return res.status(400).json({

                message:
                "Only approved budgets can be locked"

            });


        }



        // Make sure final plan exists

        if(
            !budget.finalPlan ||
            budget.finalPlan.length === 0
        ){

            return res.status(400).json({

                message:
                "No approved plan found"

            });

        }




     
        // Generate release schedule

        // For now we create a simple schedule:
        // Each category gets a release date.
        // Later will make this smarter with AI.



 // User provides the release schedule

        const {
            releases
        } = req.body;



        // Check that schedule exists

        if(
            !releases ||
            releases.length === 0
        ){

            return res.status(400).json({

                message:
                "Please provide money release dates"

            });

        }



        const lockedBudget =
        await LockedBudget.create({

            user:budget.user,

            budget:budget._id,

            lockedAmount:
            budget.monthlyAmount,

            releases

        });



        // Update budget status

        budget.status = "locked";


        await budget.save();



        res.json({

            message:
            "Budget locked successfully",


            lockedBudget

        });



    }catch(error){


        console.error(error);


        res.status(500).json({

            message:error.message

        });


    }


};