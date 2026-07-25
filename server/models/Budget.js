const mongoose = require("mongoose");


const budgetItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        priority: {
            type: String,
            enum: ["Essential", "Important", "Optional"],
            default: "Important"
        }
    },
    { _id: false }
);

const budgetSchema = new mongoose.Schema(
    {

        // Budget owner
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Total monthly budget
        monthlyAmount: {
            type: Number,
            required: true,
            min: 0
        },

       
        //  Original budget entered by the user.
        //  Never changes.
         
        expenses: [budgetItemSchema],

        
        //   AI's recommendations.
        //   Never changes after generation.
         
        aiPlan: {

            summary: String,

            improvements: [String],

            recommendedBudget: [budgetItemSchema],

            tips: [String]

        },

//    users final edited budget after reviewing AIs recommendations.
        finalPlan: [budgetItemSchema],

        
        //  Budget status.
         
        status: {
            type: String,
            enum: [
                "draft",
                "approved",
                "locked"
            ],
            default: "draft"
        }

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Budget", budgetSchema);