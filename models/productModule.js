const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const category = require('./category');
const productSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
},
discription:{
    type:String,
    required:true
},
status:{
    type:Number,
    default:0
},
quantity:{
   type:Number,
   required:true
},
price:{
    type:Number,
    required:true   
},
offerPrice:{
    type:Number,
    required:true
},
category:{
    type :ObjectId,
    ref:category,
    required:true
},
image:[{
    type:String,
    required:true
}],
available:{
    type:Number,
    default:0
},
qun:{
    type:Number,
    default:1
}
})
module.exports=mongoose.model('ProductDb',productSchema)