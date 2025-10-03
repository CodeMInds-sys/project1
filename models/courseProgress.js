const mongoose = require("mongoose");

const lectureProgressSchema= new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },
    lecture:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecture",
        required:true
    }, 
    engagement:{
        type:Number,
        default:0,
        min:0,
        max:100
    },
    attendance:{
        type:String,
        enum:["present","absent","late"],
        default:"absent"
    },

    lectureScore:{
        type : Number,
        default : 0,
        min:0,
        max:100
    },
    notes:{
        type:String,
        default : ""
    },
    task: {
        taskStatus: { type: String, enum:["pending","completed","failed","submitted"], default: "pending" },
        submittedAt: { type: Date },
        file:{
            type:String,
            default:""
        },
        score:{
            type:Number,
            default:0,
            min:0,
            max:100
        },
        notes:{
            type:String,
            default : ""
        }
    }


},
{
    timestamps:true
})  



const courseProgressSchema = new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    },
    lectureProgress:[lectureProgressSchema],
    

},
{
    timestamps:true
})

const courseProgress=mongoose.model("CourseProgress",courseProgressSchema);
const LectureProgress=mongoose.model("LectureProgress",lectureProgressSchema);
module.exports={courseProgress,LectureProgress};




