import { Request, Response } from "express"
import Product from "../models/Product"
import Order from "../models/Order"

export const getDashboardStats = async (req: Request, res: Response) => {

  try {

    const totalProducts = await Product.countDocuments()

    const totalOrders = await Order.countDocuments()

    const pendingOrders = await Order.countDocuments({
      status: "pending"
    })

    const orders = await Order.find()

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + order.totalAmount
    }, 0)

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    })

  } catch (error) {

    console.log("DASHBOARD ERROR:", error)

    res.status(500).json({
      message: "Error loading dashboard"
    })

  }

}