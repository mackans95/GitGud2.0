const jwt = require('jsonwebtoken');
const User = require("../models/users");

//Checks if there is a token with name jwt, then verifies it according to the signingkey
//takes '.id' from the token and checks the database for a user of that id
//if exists, sets req.user key on the req-object to the user cookie

function authTokenMiddleware(req, res, next) {
    const {cookies} = req;
    if('jwt' in cookies){
      try{
        const verified = jwt.verify(cookies.jwt, process.env.JWT_SIGNINGKEY);
        req.user = verified;
        if(!isUserInDb(req.user)){
          return res.status(400).send('Invalid user');
        }
        console.log('user validated');
      }
      catch(err){
        return res.status(400).send('Invalid token' + err);
      }
      //there is a user in a token, but check if it exists in database
      next();
    }
    else{
        return res.status(401).send('Unauthorized');
    }
  }
  
  function isUserInDb(user){
    if(User.findById(user.id)){
      return true;
    }
    else{
      return false;
    }
  }
  
  module.exports = authTokenMiddleware;