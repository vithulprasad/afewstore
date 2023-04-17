const express = require("express");
const user_route =  express();
const multer = require("multer");
const path = require("path");
user_route.use(express.static("public"));
const { session } = require("passport");
const { user } = require("../controllers/adminController");
const users = require("../models/userModel");

const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            const find = await users.findOne({_id:req.session.user_id,status:'banned'})
            if(find){
                console.log('user blocked');
                res.redirect('/');
            }else{}
        }
        else{
            console.log('user is not blocked');
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


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'../public/prodectImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    },
    transformer: function (req, file, cb) {
     
        sharp(file.path)
            .extract({ left: 100, top: 100, width: 200, height: 200 }) 
            .toFile(file.path, function (err, info) {
                if (err) throw err;
                cb(null, file);
            });
    }
});

const upload = multer({
    storage:storage
})

module.exports = {
    isLogin,
    isLogout,
    upload
}