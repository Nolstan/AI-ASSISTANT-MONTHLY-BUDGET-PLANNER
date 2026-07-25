
//  Stores money that has been locked after approval.
//  Tracks when each category can be released.



const mongoose = require("mongoose");


const lockedBudgetSchema = new mongoose.Schema({

    // Owner of the locked budget
    user: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required:true

    },


    // Original approved budget
    budget: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Budget",

        required:true

    },


    // Total money locked
    lockedAmount: {

        type:Number,

        required:true

    },


    // Individual release schedules
    releases:[

        {

            category:{

                type:String,

                required:true

            },


            amount:{

                type:Number,

                required:true

            },


            releaseDate:{

                type:Date,

                required:true

            },


            released:{

                type:Boolean,

                default:false

            }

        }

    ]


},

{
    timestamps:true
});


module.exports =
mongoose.model(
    "LockedBudget",
    lockedBudgetSchema
);