const mongoose = require("mongoose");
const nocache = require ('nocache')
const logger = require('morgan');
const express = require("express");
const app = express();
const adminRoute = require('./routers/adminRoute');
const userRoute = require('./routers/userRoute')
var path = require('path');
require('dotenv').config();

// Set up view engine
app.set('view engine', 'ejs');

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB).then(()=>{
    console.log("mongo connected");
})

app.use(express.json())
app.use(nocache())
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/',userRoute);
app.use('/admin',adminRoute)

// 404 error handler middleware
app.use((req, res, next) => {
    res.status(404).render('user/404error', {
      pageTitle: 'Page Not Found',
      path: req.url
    });
});

app.listen(process.env.PORT,function(){
    console.log("server is running....");
})