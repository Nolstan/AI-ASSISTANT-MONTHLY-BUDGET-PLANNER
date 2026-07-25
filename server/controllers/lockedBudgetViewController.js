
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


        const lockedBudget =
            await LockedBudget.findOne({

                user: req.user.id

            });



        if (!lockedBudget) {

            return res.status(404).json({

                message:
                "No locked budget found"

            });

        }



        res.json({

            lockedAmount:
            lockedBudget.lockedAmount,


            releases:
            lockedBudget.releases

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


        const lockedBudget =
            await LockedBudget.findOne({

                user:req.user.id

            });



        if(!lockedBudget){

            return res.status(404).json({

                message:
                "No locked budget found"

            });

        }



        const releasedItems =
            lockedBudget.releases.filter(

                item =>
                item.released === true

            );



        const availableMoney =
            releasedItems.reduce(

                (total,item)=>
                total + item.amount,

                0

            );



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


        const lockedBudget =
            await LockedBudget.findOne({

                user:req.user.id

            });



        if(!lockedBudget){

            return res.status(404).json({

                message:
                "No locked budget found"

            });

        }



        const upcoming =
            lockedBudget.releases.filter(

                item =>
                item.released === false

            );



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