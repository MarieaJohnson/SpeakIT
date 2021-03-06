var LocalStrategy   = require('passport-local').Strategy;
// load up the user model

var express=require("express");
var db=require("../models");

// expose this function to our app using module.exports
module.exports = function(passport) {
    // passport session setup

    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log("what is this....serialize..."+JSON.stringify(user));
        done(null, user.username);
    });

    // used to deserialize the user
    passport.deserializeUser(function(username, done) {
        db.User.findOne({where:{"username":username}}).then(function(user){
            done(null, user);
        })
    });


    // ============================================LOCAL SIGNUP===========================================

    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use("local-signup", new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        console.log("...................."+JSON.stringify(req.body));
        // asynchronous
        console.log("Authenticate!!!!!!!!!!!!!!!");
        // find a user whose username (PRIMARY KEY) is the same as the forms input
        // we are checking to see if the user trying to signup already exists
        db.User.findOne({where: { "username" :  username }}).then(function(result) {

            // check to see if theres already a user with that username
            if (result) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {

                // if there is no user with that username
                // create the user
                db.User.create({
                    username: username,
                    password: password,
                    gender: req.body.gender,
                    age: req.body.age,
                    about: req.body.about,
                    language: req.body.language,
                }).then(function(user) {
                    return done(null, user);
                });
            }
        });    
    }));


    // ==============================================LOCAL LOGIN ====================================

    passport.use("local-login", new LocalStrategy({
        usernameField : "username",
        passwordField : "password",
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        db.User.findOne({where:{ "username" :  username, "password": password}}).then(function(result) {
            // if no user is found, return the message
            if (result==="null"){
                return done(null, false, req.flash("loginMessage", "No matching user found")); // req.flash is the way to set flashdata using connect-flash
            }else{ //if the user is found
                console.log("you are logged in!!!");
                return done(null, result);
            }
        });
    }));

};