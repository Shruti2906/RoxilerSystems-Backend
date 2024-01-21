const mongoose = require('mongoose')

const schema = mongoose.Schema({
    id: {
        type:Number,
        required: true,
        unique: true
    },
    title:{
        type:String,
        required: true
    },
    price: {
        type:Number,
        require:true
    },
    description: {
        type:String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    image:{
        type:String,
        required: true
    },
    sold:{
        type: Boolean,
        default: false,
    },
    dateOfSale: {
        type: Date,
        required: true,
    }
});

module.exports = mongoose.model('ProductTransaction', schema);