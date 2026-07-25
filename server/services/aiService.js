
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

IMPORTANT:

Return ONLY valid JSON.

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

    return JSON.parse(
        completion.choices[0].message.content
    );

};