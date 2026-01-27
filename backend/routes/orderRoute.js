import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import Order from "../models/orderModel.js"; 

const orderRouter = express.Router()
orderRouter.get('/track/:id', authUser, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        res.json({
            success: true,
            status: order.status,
            payment: order.payment,
            paymentMethod: order.paymentMethod,
            date: order.date,
            items: order.items
        });

    } catch (err) {
        res.json({ success: false, message: "Error fetching order" });
    }
});



// Admin Features
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)

// Payment Features
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe)
orderRouter.post('/razorpay',authUser,placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders',authUser,userOrders)

// verify payment
orderRouter.post('/verifyStripe',authUser, verifyStripe)
orderRouter.post('/verifyRazorpay',authUser, verifyRazorpay)

export default orderRouter