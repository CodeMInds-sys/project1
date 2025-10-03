const mongoose = require("mongoose");

const reqToEnrollSchema = new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    status:{
        type:String,
        enum:["pending","accepted","rejected"],
        default:"pending"
    },
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group",
        default: null
    },
    joined:{
        type:Boolean,
        default:false
    }
})

const reqToEnroll = mongoose.model("ReqToEnroll",reqToEnrollSchema);
module.exports = reqToEnroll;
