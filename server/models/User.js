
//  Stores application users.
//  
//   Each user will later own:
//   Budgets -is in budget modol
//   AI generated plans -approved by user
//   Locked funds -in LockedBudget model



const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
    {

        // User's display name
        name: {
            type: String,
            required: true,
            trim: true
        },


        // Used for login
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },


        // Hashed password
        password: {
            type: String,
            required: true
        }

    },
    {
        // Automatically creates:
        // createdAt and updatedAt
        timestamps: true
    }
);


module.exports = mongoose.model("User", userSchema);