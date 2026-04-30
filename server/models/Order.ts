import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        name: String,
        price: Number,
        image: String,
        category: String,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "pending",
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },

    paymentMethod: {
      type: String,
      default: "cod",
    },

    paymentId: {
      type: String,
      default: "",
    },

    trackingSteps: {
      type: [
        {
          status: String,
          time: Date,
          message: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
