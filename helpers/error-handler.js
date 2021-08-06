function errorHandler(err,req,res,next){
    if(err.name === 'UnauthorizedError'){
        return res.status(401).json({message:"User not Authorized!"})
    }
    
    if(err.name === "ValidationError"){
        return res.status(400).json({message:"Validation Error!"})
    }

    return res.status(500).json({err})
}

module.exports = errorHandler