// This file Connect Routes 

const express = require("express");
const cors = require("cors");

const app = express();


//   Allow requests from our frontend.

app.use(cors());


// Read JSON data sent by the client.

app.use(express.json());


const path = require("path");

// Serve static frontend files from the client directory
app.use(express.static(path.join(__dirname, "../client")));

// Temporary test route / Health check for API
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "AI Monthly Budget Planner API is running."
    });
});

// connect auth routes to the application
const authRoutes = require("./routes/authRoutes");
app.use(
    "/api/auth",
    authRoutes
);

// connect budget routes 
const budgetRoutes = require("./routes/budgetRoutes");
app.use(
    "/api/budget",
    budgetRoutes
);

// connect ai routes
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

// connect locked budget routes
const lockedBudgetRoutes =
require("./routes/lockedBudgetRoutes");
app.use(
    "/api/locked-budget",
    lockedBudgetRoutes
);

// connect account routes
const accountRoutes =
require("./routes/accountRoutes");
app.use(
    "/api/account",
    accountRoutes
);


module.exports = app;