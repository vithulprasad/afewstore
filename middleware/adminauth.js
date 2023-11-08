const express = require('express');

const multer = require("multer");
const path = require("path");

const isLogin = async(req,res,next)=>{
    console.log("TRYING TO LOGIN");
    try {
        if(req.session.user_id){
           
            console.log ("SESSION IS LOGIN")
        }
        else{
            console.log('Else')
            res.redirect('/admin')
        }
        next();
    } catch (error) {
    console.log('is login error in admin session ',error.message);
    

    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/admin/home')
            
            console.log ("SESSION IS LOGOUT")
        }
        next();
    } catch (error) {
       console.log('is log out error in admin error',error.message); 
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