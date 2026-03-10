import { Request, Response } from "express"
import Order from "../models/Order"

export const createOrder = async (req:Request,res:Response)=>{
try{

const order = await Order.create(req.body)

res.json(order)

}catch(error){
res.status(500).json({message:"Order creation failed"})
}
}

export const getOrders = async (req:Request,res:Response)=>{
try{

const orders = await Order.find().sort({createdAt:-1})

res.json(orders)

}catch(error){
res.status(500).json({message:"Failed to fetch orders"})
}
}

export const updateOrderStatus = async (req:Request,res:Response)=>{

try{

const { id } = req.params
const { status } = req.body

console.log("ORDER ID:", id)
console.log("STATUS:", status)

const order = await Order.findByIdAndUpdate(
id,
{ status },
{ new:true }
)

if(!order){
return res.status(404).json({
message:"Order not found"
})
}

res.json({
message:"Order status updated",
order
})

}catch(error){

console.log("ORDER STATUS ERROR:",error)

res.status(500).json({
message:"Error updating order status"
})

}

}

export const deleteOrder = async (req:Request,res:Response)=>{
try{

const {id} = req.params

await Order.findByIdAndDelete(id)

res.json({message:"Order deleted"})

}catch(error){
res.status(500).json({message:"Delete failed"})
}
}