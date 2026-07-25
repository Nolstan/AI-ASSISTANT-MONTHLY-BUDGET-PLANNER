
//  Handles:
//  Registering users
//  Logging users in



const User = require("../models/User");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");




// Register User


exports.register = async (req, res) => {

    try {


        const {
            name,
            email,
            password
        } = req.body;



        // Check if user already exists

        const existingUser = await User.findOne({
            email
        });


        if(existingUser){

            return res.status(400).json({
                message:"User already exists"
            });

        }



        // Encrypt password
    //    we choose 10 rounds of salt for hashing the password.
    //  This is a common practice to enhance security.
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );



        // Create user

        const user = await User.create({

            name,

            email,

            password: hashedPassword

        });



        res.status(201).json({

            message:"Account created successfully",

            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }

        });



    } catch(error){


        res.status(500).json({

            message:error.message

        });


    }

};





// Login User


exports.login = async (req,res)=>{


    try{


        const {
            email,
            password
        } = req.body;



        const user = await User.findOne({
            email
        });



        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }



        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );



        if(!passwordMatch){

            return res.status(401).json({
                message:"Invalid password"
            });

        }



        // Create JWT token

        const token = jwt.sign(

            {
                id:user._id
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"7d"
            }

        );



        res.json({

            message:"Login successful",

            token

        });



    }catch(error){


        res.status(500).json({
            message:error.message
        });


    }


};