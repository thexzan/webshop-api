const User = require('../models/user')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.get('/', async (req,res) => {
    const userList = await User.find().select("-passwordHash -__v -isAdmin")

    if(!userList){
        res.status(500).json({success: false})
    }
    res.send(userList)
})

router.get("/:id", async (req,res) => {
    try{
        const user = await User.findById(req.params.id).select("-passwordHash -__v -isAdmin")
        if(!user){
            res.status(404).json({success:false,message:"User with given id not found"})
        }else{
            res.status(200).send(user)
        }
    }catch(err){
        res.status(404).json({success:false,err})
    }
})

router.post("/register", async (req,res) => {

    let user = new User({
        name: req.body.name,
        email : req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
    })

    try{
        user = await user.save()
        // if(!user){
        //     return res.status(404).send("user cant be registered")
        // }else{
            res.send(user)
        // }
    }catch(err){
        return res.status(400).json(err)
    }

})

router.post("/login", async (req,res) => {
    // check if user or pass empty
    if(!req.body.email || !req.body.password){
        return res.json({success:false,message:"email and password required"})
    }

    // check if user exist
    const user = await User.findOne({email:req.body.email})
    // if(!user) {
    //     return res.status(404).json({success:false,message:"user not found"})
    // }

    // check the password
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign({
            userId: user.id,
            email:user.email,
            isAdmin:user.isAdmin
        },
        process.env.SECRET_TOKEN,
        {expiresIn : '1d'})

        return res.json({sucess:true,user:user.email,token})
    }else{
        return res.json({sucess:false,message:"Username or Password is wrong"})
    }
})

router.delete("/:id", (req,res) => {
    User.findByIdAndRemove(req.params.id).then(User => {
        if(User){
            return res.status(200).json({success:true,message:"User deleted"})
        }else{
            return res.status(404).json({success:false,message:"User not found"})
        }
    }).catch(err => { 
        return res.status(400).json({success:false,message:err})
    })
})

router.get('/get/count',async (req,res) => {
    const userCount = await User.countDocuments(count => count)
    res.send({count:userCount})
})

module.exports = router