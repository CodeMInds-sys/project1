
const mongoose = require("mongoose");
const { Schema } = mongoose;

const guestSchema = new Schema({
    ip: {
        type: String,
        required: true,
        unique: true
    },
    views:[{
        page: {
            type: String,
        },
        count: {
            type: Number,
            default: 1
        }
    }]
});

const Guest = mongoose.model("Guest", guestSchema);

module.exports = Guest;