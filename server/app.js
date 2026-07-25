/**
 * -----------------------------------------------------
 * app.js
 * -----------------------------------------------------
 * Creates and configures the Express application.
 *
 * This file DOES NOT start the server.
 * It only prepares the app and exports it.
 * -----------------------------------------------------
 */

const express = require("express");
const cors = require("cors");

const app = express();

/**
 * Allow requests from our frontend.
 */
app.use(cors());

/**
 * Read JSON data sent by the client.
 */
app.use(express.json());

/**
 * Temporary test route.
 * Visiting http://localhost:5000/
 * should display this message.
 */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Monthly Budget Planner API is running."
    });
});

module.exports = app;