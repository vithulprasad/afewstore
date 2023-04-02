const mongoose = require('mongoose');
const productSchema= new mongoose.Schema({


    couponName :{
        type:String,
        required:true
    },


    code:{
        type:String,
        required:true
    },

    price:{
     type:Number,
     required:true
    },


    ExpDate:{
       type:Date,
       required:true
    },
    finalDate:{
        type:Date,
    }


})

module.exports = mongoose.model('coupon',productSchema);
