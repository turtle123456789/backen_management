const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        isAdmin: { type: Boolean, default: false, required: true },
        phone: { type: Number },
        address: { type: String },
        avatar: { type: String },

    },
    {
        timestamps: true
    }
);
const Customer = mongoose.model("Customer", userSchema);
module.exports = Customer;  