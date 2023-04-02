const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({

    bannerName:{
        type:String,
        required:true
    },
    description:{
      type:String
    },
    bannerUrl:{
      type:String,
      required:true

    },
    status:{
        type:Boolean,
        default:"false"
    },
    image:[{
        type:String,
        required:true
    }]

}) 

module.exports = mongoose.model('banner',productSchema);