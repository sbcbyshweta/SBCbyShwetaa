import { Request, Response } from "express"
import Product from "../models/Product"



/* ===============================
CREATE PRODUCT
POST /api/products
================================= */

export const createProduct = async (req:Request,res:Response)=>{

try{

console.log("BODY:",req.body)
console.log("FILE:",req.file)

const {name,price,category,description}=req.body

const product = await Product.create({

name,
price,
category,
description,
image:req.file ? req.file.filename : ""

})

res.json({
message:"Product created",
product
})

}catch(error){

console.log("PRODUCT ERROR:",error)

res.status(500).json({
message:"Error creating product",
error
})

}

}



/* ===============================
GET ALL PRODUCTS
GET /api/products
================================= */

export const getProducts = async (req: Request, res: Response) => {

try{

const page = Number(req.query.page) || 1
const limit = Number(req.query.limit) || 10

const search = req.query.search as string
const category = req.query.category as string

const skip = (page - 1) * limit

let filter:any = {}

if(search){
filter.name = { $regex: search, $options: "i" }
}

if(category){
filter.category = category
}

const totalProducts = await Product.countDocuments(filter)

const products = await Product.find(filter)
.sort({createdAt:-1})
.skip(skip)
.limit(limit)

res.json({
products,
currentPage: page,
totalPages: Math.ceil(totalProducts/limit),
totalProducts
})

}catch(error){

console.log("GET PRODUCTS ERROR:",error)

res.status(500).json({
message:"Error fetching products"
})

}

}



/* ===============================
DELETE PRODUCT
DELETE /api/products/:id
================================= */

export const deleteProduct = async (req:Request,res:Response)=>{

try{

const {id}=req.params

await Product.findByIdAndDelete(id)

res.json({
message:"Product deleted"
})

}catch(error){

res.status(500).json({
message:"Error deleting product"
})

}

}



/* ===============================
UPDATE PRODUCT
PUT /api/products/:id
================================= */

export const updateProduct = async (req:Request,res:Response)=>{

try{

const {id}=req.params

const updatedProduct = await Product.findByIdAndUpdate(
id,
req.body,
{new:true}
)

res.json({
message:"Product updated",
updatedProduct
})

}catch(error){

res.status(500).json({
message:"Error updating product"
})

}

}

/* ===============================
Get by PRODUCT id
GET /api/products/:id
================================= */

export const getProductById = async (req: Request, res: Response) => {

  try {

    const { id } = req.params

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    res.json(product)

  } catch (error) {

    res.status(500).json({
      message: "Error fetching product"
    })

  }

}