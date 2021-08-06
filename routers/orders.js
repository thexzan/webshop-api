const Order = require('../models/orders')
const OrderItem = require('../models/order-item')
const express = require('express')
const router = express.Router()

router.get('/',async (req,res) => {
    const orderList = await Order.find().populate("user","name email").sort({"dateOrdered" :-1})
    if(!orderList){
        res.status(404).json({success:false})
    }else{
        res.send(orderList)
    }
})

router.get("/:id", async (req,res) => {
    try{
        const order = await Order.findById(req.params.id).populate("user","name email").populate({
            path:'orderItems',
            populate:{
                path:"product",
                populate:"category"
            }
        })

        if(!order){
            res.status(404).json({success:false,message:"order with given id not found"})
        }else{
            res.status(200).send(order)
        }
    }catch(err){
        res.status(400).json({success:false,message:err})
    }
})


router.post("/", async (req,res) => {

    // Promise All to insert all order item and get the IDs
    const orderItemsIds = Promise.all(req.body.orderItems.map(async order => {
        let newOrderItem = new OrderItem({
            quantity:order.quantity,
            product:order.product
        })

        newOrderItem = await newOrderItem.save()
        return newOrderItem._id
    }))

    // awaiting order item id from above
    const orderItemsIdsResolved = await orderItemsIds

    // array containing each product price*qty
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async orderItemId =>{
        const orderItem = await OrderItem.findById(orderItemId).populate("product", "price")
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))

    // sum of all product prices above
    const totalPrice = totalPrices.reduce((total,current) => total=total+current)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress : req.body.shippingAddress,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })

    try{
        order = await order.save()
        if(!order){
            return res.status(404).send("order cant be created")
        }else{
            res.send(order)
        }
    }catch(err){
        return res.status(400).json(err)
    }

})

router.get("/get/totalsales", async (req,res) => {
    const totalSales = await Order.aggregate([
        { $group : 
            { _id: null, totalsales: 
                { $sum : '$totalPrice'
                }
            }
        }
    ])

    if(!totalSales){
        return res.status(400).json({success:false,message:"sales cant be generated"})
    }

    res.json({totalSales:totalSales[0].totalsales})
})

router.get('/get/count',async (req,res) => {
    const orderCount = await Order.countDocuments((count) => count)
    res.send({orderCount})
})

router.get('/get/orderbyuser/:id',async (req,res) => {
    const userOrderList = await Order.find({user:req.params.id}).populate({
        path:'orderItems',
        populate:{
            path:"product",
            populate:"category"
        }
    }).sort({"dateOrdered" :-1})

    if(!userOrderList){
        res.status(404).json({success:false})
    }else{
        res.send(userOrderList)
    }
})


router.put("/:id",async (req,res) => {
     const order = await Order.findByIdAndUpdate(req.params.id, {
         status: req.body.status
     },{
         new:true
     })

     if(!order){
         res.status(400).send("order cant be created")
     }else{
         res.send(order)
     }
})

router.delete("/:id", (req,res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if(order){
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success:true,message:"order deleted"})
        }else{
            return res.status(404).json({success:false,message:"order not found"})
        }
    }).catch(err => { 
        return res.status(400).json({success:false,message:err})
    })
})

module.exports = router