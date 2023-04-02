


const { session } = require("passport");
const { user } = require("../controllers/adminController");
const users = require("../models/userModel");

const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){}
        else{
            res.redirect('/');
        }
        
    } catch (error) {
        console.log('is login error in user session ',error.message);
    }
    next();
}

console.log(session.user_id);

const isLogout = async(req,res,next)=>{
    try {

         if(req.session.user_id){
          res.redirect('/home')
         }
         next();
        
        
    } catch (error) {
        console.log('is logout error in user session ',error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}