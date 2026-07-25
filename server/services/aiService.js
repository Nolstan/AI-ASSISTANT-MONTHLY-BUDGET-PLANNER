
//  This is a service prompt Responsible for communicating with Groq.
 

const groq = require("../config/groq");


//  Generate an AI budget recommendation.

exports.generateBudgetPlan = async (budget) => {

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
4. Encourage saving money.


IMPORTANT RULES:

1. The sum of every amount inside recommendedBudget MUST equal exactly MWK ${budget.monthlyAmount}.

2. Never exceed the monthly budget.

3. Never leave any money unallocated.

4. If money remains after essential expenses, allocate the remainder to Savings.

5. Every amount must be a whole number.

6. Return ONLY valid JSON.

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
            "priority":""
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

        // Convert JSON string into a JavaScript object
        return JSON.parse(content);

        };