import mongoose from "mongoose"

const productSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

description:{
type:String,
required:true
},

price:{
type:Number,
required:true
},

originalPrice:{
type:Number
},

category:{
type:String,
required:true
},

image:{
type:String
},

rating:{
type:Number,
default:5
},

stock:{
type:Number,
default:10
}

},{timestamps:true})

export default mongoose.model("Product",productSchema)