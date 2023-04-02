const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const product = require('./productModule');
const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    image:{
         type:String,
    },
    password:{
        type:String,
        required:true
    },
     phone:{
        type:Number,
        required:true
     },
    is_admin:{
        type:Number,
        // required:true
    },
    status:{
      type:String,
      default:"unbanned"
    },
    is_verified:{
        type:Number,
        default:0
    },
  is_time : {
     type:Number
    },
    check : {
      type:Number
     },
    wishlist:[{
        productId:{
          type:ObjectId,
          ref:product             
        },
        Price:{
          type:Number
        },
        name:{
          type:String
        },
        quantity:{
           type:Number
        },
        image:{
          type:String,
        },
        is_in:{
              type:Number,
              default:0
        }

   }],
   wallet:{
    type:Number,
    default:0
   }

});


module.exports  = mongoose.model('users',userSchema);

