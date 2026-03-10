import { Request, Response } from "express"
import User from "../models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"



/* ===========================
   REGISTER ADMIN
=========================== */

export const registerAdmin = async (req: Request, res: Response) => {

try{

const { name, email, password } = req.body

// check if user exists
const existingUser = await User.findOne({ email })

if(existingUser){
return res.status(400).json({
message:"User already exists"
})
}

// hash password
const hashedPassword = await bcrypt.hash(password,10)

// create user
const user = await User.create({
name,
email,
password:hashedPassword,
role:"admin"
})

res.status(201).json({
message:"Admin created successfully",
user:{
id:user._id,
name:user.name,
email:user.email,
role:user.role
}
})

}catch(error){

res.status(500).json({
message:"Error creating admin"
})

}

}




/* ===========================
   LOGIN ADMIN
=========================== */

export const loginAdmin = async (req:Request,res:Response)=>{

try{

const {email,password} = req.body

// find user
const user = await User.findOne({email})

if(!user){
return res.status(404).json({
message:"User not found"
})
}

// compare password
const isMatch = await bcrypt.compare(password,user.password)

if(!isMatch){
return res.status(401).json({
message:"Invalid credentials"
})
}

// generate token
const token = jwt.sign(
{ id:user._id },
process.env.JWT_SECRET as string,
{ expiresIn:"7d" }
)

// send response
res.json({
message:"Login successful",
token,
user:{
id:user._id,
name:user.name,
email:user.email,
role:user.role
}
})

}catch(error){

res.status(500).json({
message:"Login error"
})

}

}