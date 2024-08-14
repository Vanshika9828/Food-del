import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5174"; // Replace with your frontend URL

  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: req.body.amount * 100, // Total amount in paise
      currency: "INR",
      receipt: newOrder._id.toString(),
      payment_capture: 1, // Automatically capture payments
    });

    // Respond with the order ID, key_id, and frontend URL for payment processing
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount / 100, // Convert back to rupees (optional)
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      frontend_url: frontend_url,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};


const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
  
    try {
      if (success === "true") {
        const updatedOrder = await orderModel.findByIdAndUpdate(
          orderId,
          { payment: true },
          { new: true } // Return the updated document
        );
  
        if (!updatedOrder) {
          return res.json({ success: false, message: "Order not found" });
        }
  
        console.log("Order updated:", updatedOrder); // Log for debugging
        res.json({ success: true, message: "Paid" });
      } else {
        await orderModel.findByIdAndDelete(orderId);
        res.json({ success: false, message: "Not Paid" });
      }
    } catch (error) {
      console.error(error);
      res.json({ success: false, message: "Error" });
    }
  };


// user orders for frontend
const userOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({userId:req.body.userId});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}
// Listing orders for admin panel
const listOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// api for updating order status
const updateStatus = async (req,res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export { placeOrder,verifyOrder,userOrders,listOrders,updateStatus};