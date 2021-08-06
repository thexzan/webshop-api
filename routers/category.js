const Category = require('../models/category')
const express = require('express')
const router = express.Router()

router.get('/',async (req,res) => {
    const categoryList = await Category.find()
    if(!categoryList){
        res.status(404).json({success:false})
    }else{
        res.send(categoryList)
    }
})

router.get("/:id", async (req,res) => {
    // check if valid ID
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        const category = await Category.findById(req.params.id)
        if(!category){
            res.status(404).json({success:false,message:"category with given id not found"})
        }else{
            res.status(200).send(category)
        }
    }else{
        res.status(404).json({success:false,message:"not valid id"})
    }
})


router.post("/", async (req,res) => {
    let category = new Category({
        name: req.body.name,
        icon : req.body.icon,
        color: req.body.color
    })

    category = await category.save()
    if(!category){
        return res.status(404).send("category cant be created")
    }else{
        res.send(category)
    }

})

router.put("/:id",async (req,res) => {
     const category = await Category.findByIdAndUpdate(req.params.id, {
         name:req.body.name,
         icon:req.body.icon,
         color:req.body.color
     },{
         new:true
     })

     if(!category){
         res.status(400).send("category cant be created")
     }else{
         res.send(category)
     }
})

router.delete("/:id", (req,res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if(category){
            return res.status(200).json({success:true,message:"category deleted"})
        }else{
            return res.status(404).json({success:false,message:"category not found"})
        }
    }).catch(err => { 
        return res.status(400).json({success:false,message:err})
    })
})

module.exports = router