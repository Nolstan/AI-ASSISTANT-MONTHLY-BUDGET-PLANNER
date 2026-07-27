
//  This is a service prompt Responsible for communicating with Groq.
 

const groq = require("../config/groq");


//  Generate an AI budget recommendation.

exports.generateBudgetPlan = async (budget) => {
    try {
    // Convert expense list into readable text
    const expenseList = budget.expenses //from budget model
        .map(
            expense =>
                `- ${expense.name}: MWK ${expense.amount} (${expense.priority})`
        )
        .join("\n");


    const prompt = `

You are an expert financial advisor.

The user's monthly budget is MWK ${budget.monthlyAmount}.

These are the user's planned expenses:

${expenseList}

Your task:

1. Review the budget.
2. Suggest improvements.
3. Recommend a healthier allocation.
4. Do not include exact remaining balances or totals in the summary.
   The backend will calculate and validate all financial totals.


IMPORTANT RULES:

1. The sum of every amount inside recommendedBudget MUST equal exactly MWK ${budget.monthlyAmount}.

2. Never exceed the monthly budget.

3. Never leave any money unallocated.

4. If money remains after essential expenses, allocate the remainder to Savings.

5. Every amount must be a whole number.

6. The "priority" field for each recommended budget item MUST be strictly one of these three exact strings: "Essential", "Important", or "Optional".

7. Return ONLY valid JSON.

Format:

{
    "summary":"",
    "improvements":[
        ""
    ],
    "recommendedBudget":[
        {
            "name":"",
            "amount":0,
            "priority":"Essential"
        }
    ],
    "tips":[
        ""
    ]
}

`;

    const completion =
        await groq.chat.completions.create({ //Send a chat request to Groq and generate an AI response

            model: "llama-3.3-70b-versatile", //which model to use for generating the response

            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],

            temperature: 0.4 //controls randomness of the response. Lower mean more strict response, Higher mean more creative

        });

        // Get the AI response
        let content = completion.choices[0].message.content.trim();

        // Remove Markdown code fences if they exist
        content = content
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/, "");


            console.log("RAW AI RESPONSE FOR DEBUGGING");
            console.log(content);

        let aiPlan;
        try {
            aiPlan = JSON.parse(content);
            if (!aiPlan || typeof aiPlan !== 'object') {
                throw new Error("AI output is not a JSON object");
            }
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            // Fallback plan based on user's exact input
            aiPlan = {
                summary: "AI analysis was unavailable. We created a direct budget plan based on your inputs.",
                improvements: ["Try generating the AI plan again later."],
                recommendedBudget: budget.expenses.map(exp => ({
                    name: exp.name,
                    amount: exp.amount,
                    priority: exp.priority
                })),
                tips: []
            };
        }

        // Ensure recommendedBudget is an array
        if (!Array.isArray(aiPlan.recommendedBudget)) {
            aiPlan.recommendedBudget = [];
        }

        // Normalize priority string helper
        function normalizePriority(val) {
            if (!val) return "Important";
            const str = String(val).trim().toLowerCase();
            if (str.includes("essent") || str.includes("high") || str.includes("critical") || str.includes("top")) return "Essential";
            if (str.includes("option") || str.includes("low") || str.includes("sec") || str.includes("discretion")) return "Optional";
            return "Important";
        }

        // Sanitize AI priority outputs and ensure amounts are numbers
        aiPlan.recommendedBudget = aiPlan.recommendedBudget.map(item => ({
            name: item.name || "Unknown",
            amount: Number(item.amount) || 0,
            priority: normalizePriority(item.priority)
        }));

        // Validate and automatically correct AI budget totals
        let total = aiPlan.recommendedBudget.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        // Calculate difference between required budget and AI budget
        let difference = budget.monthlyAmount - total;

        // If AI did not allocate the full budget
        if (difference !== 0) {
            
            // If AI over-allocated (difference < 0), let's fallback to original expenses to be safe
            // or just scale down. For simplicity, if it's over budget or severely under, 
            // fallback to user's original if it's negative to avoid negative savings.
            if (difference < 0) {
                console.warn("AI over-allocated budget. Falling back to original expenses.");
                aiPlan.recommendedBudget = budget.expenses.map(exp => ({
                    name: exp.name,
                    amount: exp.amount,
                    priority: exp.priority
                }));
                // Recalculate difference for the fallback
                total = aiPlan.recommendedBudget.reduce((sum, item) => sum + item.amount, 0);
                difference = budget.monthlyAmount - total;
            }

            if (difference > 0) {
                // Find savings category
                let savings = aiPlan.recommendedBudget.find(
                    item => item.name.toLowerCase() === "savings"
                );

                if (savings) {
                    // Add remaining money to savings
                    savings.amount += difference;
                } else {
                    // If AI forgot savings completely, create a savings category
                    aiPlan.recommendedBudget.push({
                        name: "Savings",
                        amount: difference,
                        priority: "Important"
                    });
                }
            }
        }

        // Return corrected AI plan
        return aiPlan;
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};