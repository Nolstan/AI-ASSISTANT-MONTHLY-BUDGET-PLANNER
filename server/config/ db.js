
// This is a MongoDB connection configuration file. 
// It uses Mongoose to connect to the MongoDB database specified in the environment variables.


const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

    } catch (error) {

        console.error("MongoDB Connection Failed");
        console.error(error.message);
        
        //   it will exit the process with failure 
        process.exit(1);
    }
};

module.exports = connectDB;