
//   Entry point of our backend.
//  
//   its Responsibilities:
//  1. Load environment variables
//  2. Connect to MongoDB
//  3. Start the Express application


require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

// Connect to MongoDB
connectDB();

// Server Port
const PORT = process.env.PORT || 5000;

// Start Express Server
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});