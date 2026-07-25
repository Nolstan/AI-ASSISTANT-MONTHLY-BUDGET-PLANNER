
//  Stores a user's monthly budget.

//  The budget contains:
//  Total monthly amount
// Planned expenses
//  AI generated plan later
//  Approval status later
 
 


const mongoose = require("mongoose");



const budgetSchema = new mongoose.Schema(

    {


        // Owner of this budget
        user: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required:true

        },


        // The total amount the user plans to spend
        monthlyAmount: {

            type:Number,

            required:true

        },


        // User's original spending ideas
        expenses:[

            {

                name:{

                    type:String,

                    required:true

                },


                amount:{

                    type:Number,

                    required:true

                },


                priority:{

                    type:String,

                    enum:[
                        "Essential",
                        "Important",
                        "Optional"
                    ],

                    default:"Important"

                }

            }

        ],


        // AI response will be stored here later
        aiPlan:{

            type:Object,

            default:null

        },


        // Budget lifecycle
        status:{

            type:String,

            enum:[

                "draft",
                "approved",
                "locked"

            ],

            default:"draft"

        }


    },

    {
        timestamps:true
    }

);



module.exports = mongoose.model(
    "Budget",
    budgetSchema
);