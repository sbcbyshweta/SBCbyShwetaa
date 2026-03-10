import { Request, Response } from "express"
import User from "../models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"



/* ===========================
   USER SIGNUP
=========================== */

export const signup = async (req: Request, res: Response) => {

try{

const { name, email, password } = req.body

const existingUser = await User.findOne({ email })

if(existingUser){
return res.status(400).json({
message:"User already exists"
})
}

const hashedPassword = await bcrypt.hash(password,10)

const user = await User.create({
name,
email,
password:hashedPassword,
role:"user"
})

res.status(201).json({
message:"Account created successfully"
})

}catch(error){

res.status(500).json({
message:"Signup error"
})

}

}




/* ===========================
   USER LOGIN
=========================== */

export const login = async (req:Request,res:Response)=>{

try{

const {email,password} = req.body

const user = await User.findOne({email})

if(!user){
return res.status(404).json({
message:"User not found"
})
}

const isMatch = await bcrypt.compare(password,user.password)

if(!isMatch){
return res.status(401).json({
message:"Invalid credentials"
})
}

const token = jwt.sign(
{ id:user._id, role:user.role },
process.env.JWT_SECRET as string,
{ expiresIn:"7d" }
)

res.json({
message:"Login successful",
token,
email:user.email,
role:user.role
})

}catch(error){

res.status(500).json({
message:"Login error"
})

}

}




/* ===========================
   ADMIN REGISTER
=========================== */

export const registerAdmin = async (req: Request, res: Response) => {

try{

const { name, email, password } = req.body

const existingUser = await User.findOne({ email })

if(existingUser){
return res.status(400).json({
message:"User already exists"
})
}

const hashedPassword = await bcrypt.hash(password,10)

const user = await User.create({
name,
email,
password:hashedPassword,
role:"admin"
})

res.status(201).json({
message:"Admin created successfully"
})

}catch(error){

res.status(500).json({
message:"Error creating admin"
})

}

}