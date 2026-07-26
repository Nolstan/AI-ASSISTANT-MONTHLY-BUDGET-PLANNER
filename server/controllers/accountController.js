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



        const lockedBudgets = await LockedBudget.find({
            user: req.user.id
        });

        if(!lockedBudgets || lockedBudgets.length === 0){
            return res.status(404).json({
                message:"No locked budget found"
            });
        }

        let remaining = amount;

        // Collect all eligible releases across all locked budgets
        let allReleases = [];
        lockedBudgets.forEach(lb => {
            lb.releases.forEach(release => {
                const available = release.amount - (release.withdrawnAmount || 0);
                if (release.released && available > 0) {
                    allReleases.push({
                        budget: lb,
                        release: release,
                        available: available,
                        date: new Date(release.releaseDate)
                    });
                }
            });
        });

        // Sort by due dates (oldest first)
        allReleases.sort((a, b) => a.date - b.date);

        const modifiedBudgets = new Set();

        for (const item of allReleases) {
            if (remaining <= 0) break;

            const deduction = Math.min(item.available, remaining);
            item.release.withdrawnAmount = (item.release.withdrawnAmount || 0) + deduction;
            remaining -= deduction;
            
            modifiedBudgets.add(item.budget);
        }

        if(remaining > 0){
            return res.status(400).json({
                message: "Insufficient available balance"
            });
        }

        for (const budget of modifiedBudgets) {
            await budget.save();
        }



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




// This fuctions calculates

//  Locked money
//  Available money
//  Withdrawn money


exports.getBalance = async (req, res) => {

    try {


        const LockedBudget =
        require("../models/LockedBudget");


        const lockedBudgets = await LockedBudget.find({
            user:req.user.id
        });

        let lockedMoney = 0;
        let availableMoney = 0;
        let withdrawnMoney = 0;

        if (lockedBudgets && lockedBudgets.length > 0) {
            lockedBudgets.forEach(budget => {
                budget.releases.forEach(release => {
                    const remaining = release.amount - (release.withdrawnAmount || 0);

                    if(release.released){
                        availableMoney += remaining;
                    }
                    else{
                        lockedMoney += release.amount;
                    }

                    withdrawnMoney += (release.withdrawnAmount || 0);
                });
            });
        }



        res.json({

            lockedMoney,

            availableMoney,

            withdrawnMoney

        });


    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }

};






//  Get transaction history
 

exports.getTransactions = async(req,res)=>{


    try {


        const Transaction =
        require("../models/Transaction");



        const transactions =
        await Transaction.find({

            user:req.user.id

        })
        .sort({

            createdAt:-1

        });



        res.json({

            transactions

        });


    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};