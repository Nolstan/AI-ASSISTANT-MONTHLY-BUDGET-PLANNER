
//  Checks JWT token before allowing access. 

//  It helps protect routes that require authentication.
//  If the token is valid, it decodes the token 
//  If the token is invalid, it responds with a 401 Unauthorized status.




const jwt = require("jsonwebtoken");



module.exports = (req,res,next)=>{


    try{

        // Get token from the Authorization header
        // split the header to get the token part on 1
        const token =
            req.headers.authorization
            ?.split(" ")[1];



        if(!token){

            return res.status(401).json({

                message:"No token provided"

            });

        }



        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );



        req.user = decoded;



        next();



    }catch(error){


        res.status(401).json({

            message:"Invalid token"

        });


    }


};