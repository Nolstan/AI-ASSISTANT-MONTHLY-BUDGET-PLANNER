
// This file Handles:

// Creating budgets
// Viewing user budgets



const Budget = require("../models/Budget");



// Create Budget


exports.createBudget = async(req,res)=>{


    try{


        const {

            monthlyAmount,

            expenses

        } = req.body;



        const budget = await Budget.create({

            user:req.user.id,

            monthlyAmount,

            expenses

        });



        res.status(201).json({

            message:"Budget created successfully",

            budget

        });



    }catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};





// Get User Budgets


exports.getBudgets = async(req,res)=>{


    try{


        const budgets = await Budget.find({

            user:req.user.id

        });



        res.json({

            budgets

        });



    }catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};