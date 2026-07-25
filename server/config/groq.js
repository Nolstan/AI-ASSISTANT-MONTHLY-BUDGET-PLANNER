// Creates and exports a reusable Groq client.
//  this configuration allows us to talk to external service (Groq API) 
//  using API key stored in the environment variables.
const Groq = require("groq-sdk");


const groq = new Groq({

    apiKey: process.env.GROQ_API_KEY

});


module.exports = groq;