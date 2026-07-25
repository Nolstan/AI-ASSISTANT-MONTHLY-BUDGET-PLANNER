// Entry point of our backend.
//
// Responsibilities:
// 1. Load environment variables
// 2. Connect to MongoDB
// 3. Start scheduled services
// 4. Start the Express application

require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

const {
    startReleaseService
} = require("./services/releaseService");


// Server Port
const PORT = process.env.PORT || 5000;


// Start everything only after MongoDB connects
connectDB()
    .then(() => {

        // Start cron jobs
        startReleaseService();

        // Start Express server
        app.listen(PORT, () => {

            console.log(
                `Server running on port ${PORT}`
            );

        });

    })
    .catch(error => {

        console.error(
            "Failed to start server:",
            error
        );

    });