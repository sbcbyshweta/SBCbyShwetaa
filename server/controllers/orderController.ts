import { Request, Response } from "express";
import Order from "../models/Order";

export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log("=== CREATE ORDER ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const { items, amount, paymentId, paymentMethod, customer } = req.body;

    if (!customer || !items || !amount) {
      return res.status(400).json({
        message: "Missing required fields",
        error: "customer, items, and amount are required",
      });
    }

    const fullAddress = [
      customer.address,
      customer.city,
      customer.state,
      customer.zipCode,
      customer.country,
    ]
      .filter(Boolean)
      .join(", ");

    const products = items.map((item: any) => ({
      productId: item.id || item.productId,
      quantity: item.quantity || 1,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    }));

    const order = await Order.create({
      customerName:
        `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
      email: customer.email,
      phone: customer.phone,
      address: fullAddress,
      products,
      totalAmount: amount,
      status: "pending",
      paymentMethod: paymentMethod || "cod",
      paymentId: paymentId || "",
    });

    console.log("Order created:", order._id);

    const populatedOrder = await Order.findById(order._id).populate(
      "products.productId",
      "name image price",
    );

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      order: populatedOrder,
    });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      message: "Order creation failed",
      error: error.message,
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    console.log("=== GET ALL ORDERS ===");

    const orders = await Order.find()
      .populate("products.productId", "name image price")
      .sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders`);

    res.json(orders);
  } catch (error: any) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    console.log("=== GET MY ORDERS ===");
    console.log("Query:", req.query);

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const orders = await Order.find({ email })
      .populate("products.productId", "name image price")
      .sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders for ${email}`);

    res.json(orders);
  } catch (error: any) {
    console.error("GET MY ORDERS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log("=== GET ORDER BY ID ===", id);

    const order = await Order.findById(id).populate(
      "products.productId",
      "name image price",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error: any) {
    console.error("GET ORDER ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("ORDER ID:", id);
    console.log("STATUS:", status);

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.log("ORDER STATUS ERROR:", error);
    res.status(500).json({
      message: "Error updating order status",
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await Order.findByIdAndDelete(id);

    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    console.log("=== CANCEL ORDER ===");
    console.log("Order ID:", id, "Email:", email);

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.email !== email) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Order can only be cancelled before confirmation",
      });
    }

    order.status = "cancelled";
    await order.save();

    console.log("Order cancelled:", id);
    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error: any) {
    console.error("CANCEL ORDER ERROR:", error);
    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};
