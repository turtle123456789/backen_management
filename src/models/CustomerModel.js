const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String },
    phone: { type: String, required: true, unique: true },
    debt: { type: String },
    loan: { type: String },
    interestRate: { type: String },
    serviceFee: { type: String },
    exemption: { type: String },
    amountPaid: { type: String },
    status: { type: String, default: 'Pending' },
    loanDate: { type: String },
    paymentTerm: { type: String },
    isAdmin: { type: Boolean, default:false }
}, {
    timestamps: true
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
