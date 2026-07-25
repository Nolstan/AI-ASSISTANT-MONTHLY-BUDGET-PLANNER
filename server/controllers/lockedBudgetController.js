
//  This file Converts an approved budget into a locked budget.
//  The users money is divided into scheduled releases and ofcourse with a cronjob.
 

exports.lockBudget = async (req, res) => {

    try {

        const budget = await Budget.findOne({

            _id:req.params.id,

            user:req.user.id

        });


        if(!budget){

            return res.status(404).json({

                message:"Budget not found"

            });

        }


        if(budget.status !== "approved"){

            return res.status(400).json({

                message:
                "Only approved budgets can be locked"

            });

        }


        if(
            !budget.finalPlan ||
            budget.finalPlan.length === 0
        ){

            return res.status(400).json({

                message:
                "No approved plan found"

            });

        }



       
        
        // Get user release schedule
        
        const {
            releases
        } = req.body;



        if(
            !releases ||
            releases.length === 0
        ){

            return res.status(400).json({

                message:
                "Please provide money release dates"

            });

        }



        
        // Validate release amounts
        

        const releaseTotal =
        releases.reduce(

            (sum,item)=>
            sum + item.amount,

            0

        );


        if(releaseTotal !== budget.monthlyAmount){

            return res.status(400).json({

                message:
                "Release amounts must equal approved budget"

            });

        }



       
        // Create locked budget
       

        const lockedBudget =
        await LockedBudget.create({

            user:budget.user,

            budget:budget._id,

            lockedAmount:
            budget.monthlyAmount,

            releases

        });



        budget.status = "locked";


        await budget.save();



        res.json({

            message:
            "Budget locked successfully",

            lockedBudget

        });



    } catch(error){

        console.error(error);

        res.status(500).json({

            message:error.message

        });

    }

};