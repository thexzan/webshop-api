const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

require("dotenv/config")
const api = process.env.API_URL

app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)
app.use('/public/uploads', express.static('public/uploads'));


const productRouter = require('./routers/products')
const categoryRouter = require('./routers/category')
const userRouter = require('./routers/users')
const orderRouter = require('./routers/orders')

app.use(`${api}/products`,productRouter)
app.use(`${api}/category`,categoryRouter)
app.use(`${api}/user`,userRouter)
app.use(`${api}/order`,orderRouter)


mongoose.connect(process.env.CONNECTION_STRING,
{   useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => {
    console.log('DB Ready')
}).catch((err) => {
    console.log(err)
})

app.listen(3000, () => {
    console.log("server started at 3000")
})