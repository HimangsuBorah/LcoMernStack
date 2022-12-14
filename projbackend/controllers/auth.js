const User = require('../models/user.js');
const { check, validationResult } = require("express-validator");
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

exports.signup = (req, res) => {

    const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {

        return `${location}[${param}]: ${msg}`;
    };
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {

        return res.json({ errors: result.array() });
    }

    const user = new User(req.body)
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: "Not able to save User in DB "
            })
        }

        res.json({
            name: user.name,
            lastname:user.lastname,
            email: user.email,
            id: user._id
        })
    })
};

exports.signin = (req, res) => {
    const { email, password } = req.body;
    const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {

        return `${location}[${param}]: ${msg}`;
    };
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {

        return res.json({ errors: result.array() });
    }

    User.findOne({email},(err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:"User Email does not exists"
            })
        }

        if(!user.authenticate(password)){
            return res.status(401).json({
                error:"Email and password do not match"
            });
        }
        //create token

        const token = jwt.sign({_id:user._id},process.env.SECRET);

        //put token in cookie
        res.cookie("token",token,{expire:new Date()+9999});

        //send rensponse to front end

        const {_id,name,email,role}=user;
        return res.json({token,user:{_id,name,email,role}});
    })

};


exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "User signout successfully"
    })
};


//protected routes

exports.isSignedIn = expressJwt({
    secret:process.env.SECRET,
    userProperty:"auth"
});


//custom middleware

exports.isAuthenticated =(req,res,next)=>{
    let checker =  req.profile && req.auth && req.profile._id == req.auth._id;
    if(!checker){
        return res.status(403).json({
            error:"ACCESS DENIED"
        });
    }
    next();
}

exports.isAdmin =(req,res,next)=>{
    if(req.profile.role === 0){
        return res.status(403).json({
            error:"You are not ADMIN, ACCESS DENIED"
        });
    }
    next();
}