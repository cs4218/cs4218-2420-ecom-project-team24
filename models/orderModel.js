import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
        required: true,
      },
    ],
    payment: {
      type: Object,
      default: {},
    },
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "delivered", "cancel"],
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.path("products").validate(function (value) {
  return value.length > 0;
}, "Products array cannot be empty");

export default mongoose.model("Order", orderSchema);
