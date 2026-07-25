// This file is responsible for handling the withdrawal 
// of released money from a users locked budget.

const LockedBudget =
require("../models/LockedBudget");

const Transaction =
require("../models/Transaction");




//  Withdraw released money

exports.withdrawMoney = async(req,res)=>{


    try {


        const {
            amount,
            category
        } = req.body;



        const lockedBudget =
        await LockedBudget.findOne({

            user:req.user.id

        });



        if(!lockedBudget){

            return res.status(404).json({

                message:"No locked budget found"

            });

        }



        let remaining =
        amount;



        for(const release of lockedBudget.releases){


            const available =
            release.amount -
            release.withdrawnAmount;



            if(
                release.released &&
                available > 0 &&
                remaining > 0
            ){

                const deduction =
                Math.min(
                    available,
                    remaining
                );


                release.withdrawnAmount += deduction;


                remaining -= deduction;

            }

        }



        if(remaining > 0){

            return res.status(400).json({

                message:
                "Insufficient available balance"

            });

        }



        await lockedBudget.save();



        await Transaction.create({

            user:req.user.id,

            type:"WITHDRAW",

            amount,

            category,

            description:
            "User withdrawal"

        });



        res.json({

            message:
            "Withdrawal successful",

            amount

        });


    }

    catch(error){

        res.status(500).json({

            message:error.message

        });

    }


};