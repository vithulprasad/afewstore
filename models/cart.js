const mongoose = require('mongoose');
const users = require('./userModel');
const { ObjectId } = require("mongodb");

const product = require('./productModule');
const cartSchema = new mongoose.Schema({
     user:{
        type:ObjectId,
        ref:users
     },
     status:{
      type:Number,
      default:0
     },
     active:{
       type:Number,
       default:0
     },
     totalPrice:{
      type:Number,
      default:0
    },
    coupon:{
      type:Number,
      default:0
    },
    couponNumber:{
      type:String,
    },
     find:{
         type :Number,
         default:0
     },
     address:[{
      
          firstName:{type:String},
          lastName:{type:String},
          house:{type:String},
          post:{type:String},
          city:{type:String},
          district:{type:String},
          state:{type:String},
          pin:{type:Number},
          is_in:{type:Number,default:0}
     }],
     orderDate:{
         type:Date
     },
     products:[{
          productId:{
             type:ObjectId,
             ref:product
          },
          quantity:{
            type:Number,
            default:0
          },
          avs:{
             type:Number,
             default:0
          },
          productPrice:{
            type:Number,
            default:0
          },
          totalPrice:{
            type:Number,
            default:0
          },
          price:{
            type:Number,
            default:0
          },
          name:{
            type:String,
          },
          cancel:{
            type:Number,
            default:0
          },
          proId:{
            type:Number,
            default:0
            
          },

          image:{
            type:String
          }
      
     }],
    
})
module.exports=mongoose.model('Cart',cartSchema)
