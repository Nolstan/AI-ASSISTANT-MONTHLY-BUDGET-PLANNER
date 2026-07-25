// This file Connect Routes 

const express = require("express");
const cors = require("cors");

const app = express();


//   Allow requests from our frontend.

app.use(cors());


// Read JSON data sent by the client.

app.use(express.json());


//   Temporary test route.


app.get("/", (req, res) => {
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



module.exports = app;