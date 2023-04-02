const express = require('express');
const admin_route = express();
const logger = require('morgan');
const session = require("express-session");
const config = require("../config/config");
const bodyParser = require("body-parser");
const auth = require("../middleware/adminauth")
const adminController = require("../controllers/adminController")




admin_route.use(session({
    name: "session-id",
    secret: "GFGEnter", // Secret key,
    saveUninitialized: false,
    resave: false,
    
}))


admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));
admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');


const multer = require("multer");
const path = require("path");

admin_route.use(express.static("public"));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'../public/prodectImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
});
const upload = multer({
    storage:storage
})


admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin)
admin_route.get('/home',auth.isLogin,adminController.loadHome);
admin_route.get('/logoutAdmin',adminController.adminLogout);
admin_route.get('/homeIndex',adminController.homeIndex);

admin_route.get('/product',auth.isLogin,adminController.productLoad)
admin_route.get('/productAdd',auth.isLogin,adminController.product)
admin_route.post('/addProduct',auth.isLogin,upload.array('image',10),adminController.addProduct)
admin_route.get('/addProductLoad',auth.isLogin,adminController.addProductLoad)
admin_route.get('/deleteProduct',auth.isLogin,adminController.deleteProduct)
admin_route.get('/updateProduct',auth.isLogin,adminController.updateProduct);
admin_route.post('/updateProduct',auth.isLogin,upload.array('image',10),adminController.productUpdate);
admin_route.post('/updateProductImage',auth.isLogin,upload.array('image',10),adminController.updateProductImage)
admin_route.get('/deleteProductImage',auth.isLogin,adminController.deleteProductImage)
admin_route.get('/list',auth.isLogin,adminController.list);
admin_route.get('/unlist',auth.isLogin,adminController.unlist);
admin_route.get('/productSinglepage',auth.isLogin,adminController.productSinglepage);



admin_route.get('/category',auth.isLogin,adminController.category);
admin_route.get('/addCategory',auth.isLogin,adminController.addCategory);
admin_route.post('/categoryAdd',auth.isLogin,upload.array('image',10),adminController.categoryAdd)
admin_route.get('/updateCategory',auth.isLogin,adminController.updateCategory);
admin_route.post('/categoryUpdate',auth.isLogin,upload.array('image',10),adminController.categoryUpdate);



admin_route.get('/user',auth.isLogin,adminController.user);
admin_route.get('/cat',auth.isLogin,adminController.cat);
admin_route.get('/banned',auth.isLogin,adminController.banned);
admin_route.get('/unbanned',auth.isLogin,adminController.unbanned);


admin_route.get('/banner',auth.isLogin,adminController.banner);
admin_route.get('/bannerAdd',auth.isLogin,adminController.bannerAdd);
admin_route.post('/bannerSubmit',auth.isLogin,upload.array('image',10),adminController.bannerSubmit);
admin_route.get('/deleteBanner',auth.isLogin,adminController.deleteBanner);



admin_route.get('/coupon',auth.isLogin,adminController.coupon);
admin_route.get('/couponAdd',auth.isLogin,adminController.couponAdd);
admin_route.post('/couponSubmit',auth.isLogin,adminController.couponSubmit);
admin_route.get('/couponDelete',auth.isLogin,adminController.couponDelete);


admin_route.get('/order',auth.isLogin,adminController.order);
admin_route.get('/ordered',auth.isLogin,adminController.orderd);
admin_route.get('/OrderShipped',auth.isLogin,adminController.OrderShipped);
admin_route.get('/Delivered',auth.isLogin,adminController.Deliverd);
admin_route.get('/OrderCanceled',auth.isLogin,adminController.OrderCanceled);
admin_route.get('/completed',auth.isLogin,adminController.compleat);




admin_route.get('/productOrder',auth.isLogin,adminController.productOrder);
admin_route.post('/exelSheet',auth.isLogin,adminController.exelSheet);




admin_route.get('*',function (req,res) {
    res.redirect('/admin');  
})

module.exports=admin_route