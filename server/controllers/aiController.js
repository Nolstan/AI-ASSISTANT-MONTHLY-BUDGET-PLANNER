
//  it Generates an AI budget plan and stores it.


const Budget = require("../models/Budget");

const {
    generateBudgetPlan
} = require("../services/aiService");


exports.generatePlan = async (req, res) => {

    try {

        const budget = await Budget.findOne({

            _id: req.params.budgetId,

            user: req.user.id

        });

        if (!budget) {

            return res.status(404).json({

                message: "Budget not found"

            });

        }

        const aiPlan =
            await generateBudgetPlan(budget);

        budget.aiPlan = aiPlan;

        await budget.save();

        res.json({

            message: "AI plan generated successfully",

            aiPlan

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: error.message

        });

    }

};