const mongoose = require("mongoose");


function normalizePriority(val) {
    if (!val) return "Important";
    const str = String(val).trim().toLowerCase();
    if (str.includes("essent") || str.includes("high") || str.includes("critical") || str.includes("top")) return "Essential";
    if (str.includes("option") || str.includes("low") || str.includes("sec") || str.includes("discretion")) return "Optional";
    return "Important";
}

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
            default: "Important",
            set: normalizePriority
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