const Product = require('../models/products')
const express = require('express')
const router = express.Router()
const multer = require('multer')
const mongoose = require('mongoose');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid) {
            uploadError = null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
const uploadOptions = multer({ storage: storage })

router.get('/',async (req,res) => {
    const productList = await Product.find().populate("category")
    res.send(productList)
})

router.get('/:id',async (req,res) => {
    try{
        const product = await Product.findById(req.params.id).populate("category")
        if(!product){
            return res.status(404).json({success:false,message:"Product with given id not found"})
        }
        res.send(product)
    }catch(err){
        res.status(404).json({success:false,message:err})
    }
})

router.post('/', uploadOptions.single('image'), async (req,res) => {
    
    const Category = require('../models/category')

    // check if no image selected
    if(!req.file){
        return res.status(400).json({success:false,message:"no image uploaded"})
    }
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    try{
        const category = await Category.findById(req.body.category)
        if(!category) return res.status(404).json({success:false,message:"Category ID not found"})
    }catch(err){
        return res.status(404).json({success:false,message:"invalid Category ID",err})
    }

    const product = new Product({
        name : req.body.name,
        description : req.body.description,
        richDescription : req.body.richDescription,
        image : `${basePath}${fileName}`,
        brand : req.body.brand,
        price : req.body.price,
        category : req.body.category,
        countInStock : req.body.countInStock,
        rating : req.body.rating,
        numReviews : req.body.numReviews,  
        isFeatured : req.body.isFeatured
    })

    try{
        const createdProduct = await product.save()
        res.status(201).json(createdProduct)
    }catch(err){
        res.status(500).json({
            error:err,
            success: false 
        })
    }
})

router.put("/:id",uploadOptions.single('image'),async (req,res) => {
    
    const Category = require('../models/category')

    console.log(req.body.name)
    console.log("aaaaa")

    // check if no image selected
    if(!req.file){
        return res.status(400).json({success:false,message:"no image uploaded"})
    }
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    // Check if category exist
    try{
        const category = await Category.findById(req.body.category)
        if(!category) {
            return res.status(404).json({success:false,message:"Category ID not found"})
        }
    }catch(err){
        return res.status(404).json({success:false,message:"invalid Category ID",err})
    }

    const product = await Product.findByIdAndUpdate(req.params.id, {
        name : req.body.name,
        description : req.body.description,
        richDescription : req.body.richDescription,
        image : `${basePath}${fileName}`,
        brand : req.body.brand,
        price : req.body.price,
        category : req.body.category,
        countInStock : req.body.countInStock,
        rating : req.body.rating,
        numReviews : req.body.numReviews,  
        isFeatured : req.body.isFeatured
    },{
        new:true
    })

    if(!product){
        res.status(400).json({success:false,message:"product cant be created"})
    }else{
        res.send(product)
    }
})

router.put(
    "/gallery-images/:id",
    uploadOptions.array('images',10),
    async (req,res) => {
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({success:false,message:"invalid ID"})
        }
        const files = req.files
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        let imagesPaths = []

        if(files){
            files.map(file => {
                imagesPaths.push(`${basePath}${file.filename}`)
            })
        }else{
            return res.status(400).send("no images")
        }

        const product = await Product.findByIdAndUpdate(req.params.id, {
            images : imagesPaths,
        },{
            new:true
        })

        if(!product){
            res.status(400).json({success:false,message:"product cant be created"})
        }else{
            res.send(product)
        }
})

router.delete("/:id", (req,res) => {
    Product.findByIdAndRemove(req.params.id).then(Product => {
        if(Product){
            return res.status(200).json({success:true,message:"Product deleted"})
        }else{
            return res.status(404).json({success:false,message:"Product not found"})
        }
    }).catch(err => { 
        return res.status(400).json({success:false,message:err})
    })
})

router.get('/get/count',async (req,res) => {
    const productCount = await Product.countDocuments((count) => count)
    res.send({productCount})
})

router.get('/get/featured',async (req,res) => {
    const productFeatured = await Product.find({isFeatured:true})
    res.send({productFeatured})
})

router.get('/get/featured/:count',async (req,res) => {
    const count = req.params.count ? req.params.count : 0;
    const productFeatured = await Product.find({isFeatured:true}).limit(+count)
    res.send({productFeatured})
})

router.get('/category/:id',async (req,res) => {
    const productByCategory = await Product.find({category:req.params.id})
    res.send({productByCategory})
})


module.exports = router