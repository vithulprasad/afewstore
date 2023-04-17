
const express = require("express");
const user_route =  express();
const logger = require('morgan');
const users = require("../models/userModel");
const Jimp = require('jimp');
const sharp = require('sharp');
const session = require("express-session");
const config = require("../config/config")
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");

user_route.use(express.static("public"));
user_route.use(session({
    name: "session-id",
    secret: "GFGEnter", // Secret key,
    saveUninitialized: false,
    resave: false,
    
}))


user_route.set('view engine','ejs');
user_route.set('views','./views/user');
const bodyParser = require('body-parser');
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))
const userController = require("../controllers/userController");




user_route.get('/register',auth.isLogout,userController.loadRegister);
user_route.post('/register',userController.insertUser);
user_route.get('/',auth.isLogout,userController.homeLoad)
user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.post('/login',userController.login)



user_route.get('/home',auth.isLogin,userController.homeLoad)

user_route.get('/Email',userController.EmailVerification)

user_route.get('/logout',auth.isLogin,userController.userLogout)
user_route.get('/otpLogin',userController.otpLogin)
user_route.get('/otpPage',userController.otpPage);
user_route.post('/otpCheck',userController.ottp)
user_route.post('/ottpCompare',userController.ottpCompare);
user_route.get('/resendOTP',userController. resendOTP);
user_route.get('/singleProduct',userController.singleProduct );
user_route.get('/editProfile',userController.editProfile);



user_route.get('/cart',userController.cart);
user_route.patch('/cartAdd',auth.isLogin,userController.cartAdd);
user_route.get('/cartPage',userController.cartPage);
user_route.get('/checkout',auth.isLogin,userController.checkout);
user_route.get('/removeCart',auth.isLogin,userController.removeCart);
user_route.post('/checkoutAdd',auth.isLogin,userController.checkoutAdd);





user_route.patch('/purchase',auth.upload.array('image',10),userController.purchase);
user_route.get('/details',auth.isLogin,userController.details);
user_route.get('/ChangeAddress',auth.isLogin,userController.ChangeAddress);
user_route.post('/addressAdd',auth.isLogin,userController.addressAdd);
user_route.get('/UsedAddress',auth.isLogin,userController.UsedAddress);
user_route.post('/AddAddress',auth.isLogin,userController.AddAddress);
user_route.patch('/editAddress',auth.isLogin,userController.editAddress);
user_route.patch('/deleteAddress',auth.isLogin,userController.deleteAddress);




user_route.get('/confirmation',auth.isLogin,userController.confirmation);
user_route.get('/cancel',auth.isLogin,userController.cancel);
user_route.get('/return',auth.isLogin,userController.returnOrder);

user_route.get('/wishlist',userController.wishlist);

user_route.get('/removeWishlist',auth.isLogin,userController.removeWishlist)
user_route.patch('/increment',auth.isLogin,userController.increment)
user_route.patch('/decrement',auth.isLogin,userController.decrement)
user_route.patch('/sum',userController.sum)
user_route.patch('/set',userController.set)
user_route.patch('/setAll',userController.setAll)
user_route.patch('/setSingle',userController.setSingle)
user_route.patch('/wishlist',auth.isLogin,userController.wishAdd)
user_route.post('/couponApply',auth.isLogin,userController.couponApply)
user_route.patch('/change',userController.change)
user_route.patch('/verify-payment',auth.isLogin,userController.rozoPayment)



user_route.get('/profile',auth.isLogin,userController.profile);
user_route.post('/profileEdit',auth.isLogin,auth.upload.array('image',10),userController.profileEdit);
user_route.get('/category',userController.category);
user_route.patch('/ChangeCategory',userController.ChangeCategory);
user_route.patch('/search',userController.search);
user_route.patch('/priceOrder',userController.priceOrder);
user_route.post('/passwordChange',userController.passwordChange);
user_route.get('/successPage',auth.isLogin,userController.successPage);


module.exports = user_route;
