
//  Stores every money movement:

//  RELEASE  means Money became available from locked budget
//  WITHDRAW means User took money out



const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema(

    {

        user: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },


        type: {

            type: String,

            enum: [

                "RELEASE",

                "WITHDRAW"

            ],

            required: true

        },


        amount: {

            type: Number,

            required: true

        },


        category: {

            type: String

        },


        description: {

            type: String

        }


    },

    {

        timestamps: true

    }

);



module.exports =
mongoose.model(
    "Transaction",
    transactionSchema
);