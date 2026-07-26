
// use to
//  1. Allow users to view their locked budget
//  2. Show money that has been released
//  3. Show upcoming scheduled releases

//  only if the user is authenticated.

const LockedBudget =
require("../models/LockedBudget");




//  Get user locked budget

//  Total locked amount
//  All scheduled releases

exports.getLockedBudget = async (req, res) => {

    try {


        const lockedBudgets = await LockedBudget.find({
            user: req.user.id
        }).populate('budget');

        if (!lockedBudgets || lockedBudgets.length === 0) {
            return res.status(404).json({
                message: "No locked budgets found"
            });
        }

        let totalLockedAmount = 0;
        lockedBudgets.forEach(lb => totalLockedAmount += lb.lockedAmount);

        res.json({
            totalLockedAmount,
            lockedBudgets
        });


    }

    catch(error) {


        console.error(error);


        res.status(500).json({

            message:error.message

        });

    }

};






// Shows money that cron has unlocked.
 

exports.getAvailableMoney = async (req,res)=>{


    try {


        const lockedBudgets = await LockedBudget.find({
            user: req.user.id
        });

        if(!lockedBudgets || lockedBudgets.length === 0){
            return res.status(404).json({
                message: "No locked budgets found"
            });
        }

        let releasedItems = [];
        let availableMoney = 0;

        lockedBudgets.forEach(budget => {
            const items = budget.releases.filter(item => item.released === true);
            releasedItems = releasedItems.concat(items);
            
            availableMoney += items.reduce((total, item) => total + (item.amount - (item.withdrawnAmount || 0)), 0);
        });

        res.json({
            availableMoney,
            releasedItems
        });


    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};






//  Get upcoming releases money


exports.getUpcomingReleases = async(req,res)=>{


    try {


        const lockedBudgets = await LockedBudget.find({
            user: req.user.id
        });

        if(!lockedBudgets || lockedBudgets.length === 0){
            return res.status(404).json({
                message: "No locked budgets found"
            });
        }

        let upcoming = [];
        lockedBudgets.forEach(budget => {
            const items = budget.releases.filter(item => item.released === false);
            upcoming = upcoming.concat(items);
        });

        res.json({
            upcoming
        });


    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};