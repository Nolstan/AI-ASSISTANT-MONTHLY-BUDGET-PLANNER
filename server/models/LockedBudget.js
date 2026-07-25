
//  Stores money that has been ged after approval.
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

// Individual money release schedules
releases:[

    {

        // Budget category
        category:{

            type:String,

            required:true

        },


        // Amount to release
        amount:{

            type:Number,

            required:true

        },


        // User decides this date
        releaseDate:{

            type:Date,

            required:true

        },


        // Has this money been released?
        released:{

            type:Boolean,

            default:false

        },


        // Amount already withdrawn by user
        withdrawnAmount:{

            type:Number,

            default:0

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