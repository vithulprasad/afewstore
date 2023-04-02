const mongoose = require('mongoose');
const users = require('./userModel');
const cart = require('./cart');
const category = require('./category');
const { ObjectId } = require("mongodb");

const ordersmodel= new mongoose.Schema({

    user :{
        type:ObjectId ,
        ref:users
    },
    orderId:{
        type:String ,
       
    },
    update :{
        type:String ,
     
    },
    options :{
        type:String ,
       
    },
    orderType:String ,

 
    products:[{
          name:{
            type:String
          },
          price :{
            type:Number
         },
         productId:{
            type:ObjectId,
         },  
        image:{
            type:String,
        
         },
         quantity:{
            type:Number
        },
        category:{
            type:String,
        },
    }],


    date:{
        type:Date
    },
   
    Cart:{
        type:ObjectId,
        ref:cart
    },
    status:{
        type:String
    },
    order_status:{
        type:String
    },
    address:{
        productId:{type:String},
        firstName:{type:String},
        lastName:{type:String},
        house:{type:String},
        post:{type:String},
        city:{type:String},
        district:{type:String},
        state:{type:String},
        pin:{type:Number},
      
   },
   check:{
    type:Number,
    default:0
   },
   coupon:{
        type:Number,
        default:0
   },
   couponNumber:{
    type:String,
    default:0
},
totalPrice:{
    type:Number,
}
})

module.exports = mongoose.model('order',ordersmodel);



