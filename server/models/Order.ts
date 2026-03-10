import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({

customerName:{
type:String,
required:true
},

email:{
type:String,
required:true
},

phone:{
type:String
},

address:{
type:String,
required:true
},

products:[
{
productId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Product"
},
quantity:Number
}
],

totalAmount:{
type:Number,
required:true
},

status:{
type:String,
default:"pending"
}

},{timestamps:true})

export default mongoose.model("Order",orderSchema)