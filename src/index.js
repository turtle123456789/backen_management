const express = require("express");
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose = require("mongoose");
const Customer = require("./models/CustomerModel")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save files
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Set the filename
    }
});

const upload = multer({ storage: storage });
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

app.use(bodyParser.json())
mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => {
        console.log('Connect Db success!');
    })
    .catch((err) => {
        console.log(err);
    });
app.listen(port, () => {
    console.log('Server is running in port: ', + port);
});
app.post('/api/createCustomer', async (req, res) => {
    try {
        const {
            name, phone, debt, loan, interestRate, serviceFee,
            exemption, amountPaid, status, loanDate, paymentTerm,isAdmin
        } = req.body;
        if (!isAdmin) {
            return res.status(403).json({
                status: 'Error',
                message: "Bạn không có quyền thực hiện hành động này!"
            });
        }
        console.log('Received data:', {
            name, phone, debt, loan, interestRate, serviceFee,
            exemption, amountPaid, status, loanDate, paymentTerm
        });
        const checkCustomer = await Customer.findOne({ phone });
            console.log('Existing customer:', checkCustomer);

        if (checkCustomer) {
            return res.status(409).json({
                status: 'Error',
                message: "Số điện thoại đã tồn tại!"
            });
        }

        const createdCustomer = await Customer.create({
            name, phone, debt, loan, interestRate, serviceFee,
            exemption, amountPaid, status, loanDate, paymentTerm
        });

        res.status(201).json({
            status: 'Success',
            message: "Thêm thông tin khách hàng thành công",
            data: createdCustomer
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            status: 'Error',
            message: "Server lỗi"
        });
    }
});

app.get('/api/getCustomer',async (req,res)=>{
    try{
    const customer = await Customer.find();
    res.status(200).json({
            message: "Danh sách khách hàng",
            customers: customer
        });
    }catch (err){ 
        console.error(err);
        res.status(500).json({ message: "Server error" });

    }
})
app.put('/api/editCustomer/:id', async (req, res) => {
    try {
        const { isAdmin } = req.body; 
        if (!isAdmin) {
            return res.status(403).json({
                status: 'Error',
                message: "Bạn không có quyền thực hiện hành động này!"
            });
        }

        const {
            name, phone, debt, loan, interestRate, serviceFee,
            exemption, amountPaid, status, loanDate, paymentTerm
        } = req.body;

        const { id } = req.params;
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({
                status: 'Error',
                message: "Khách hàng không tồn tại!"
            });
        }
        const updatedCustomer = await Customer.findByIdAndUpdate(id, {
            name, phone, debt, loan, interestRate, serviceFee,
            exemption, amountPaid, status, loanDate, paymentTerm
        }, { new: true });

        res.status(200).json({
            status: 'Success',
            message: "Cập nhật thông tin khách hàng thành công",
            data: updatedCustomer
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            status: 'Error',
            message: "Server lỗi"
        });
    }
});


app.get('/api/customers/:phone', async (req,res) => {
    try {
        const { phone } = req.params;
        const customer = await Customer.findOne({ phone: phone });
        if (!customer) {
            return res.status(404).json({
                message: "Khách hàng không tồn tại"
            });
        }
        res.status(200).json({
            message: "Thông tin chi tiết khách hàng",
            customer: customer
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});
app.delete('/api/deleteCustomer/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const { isAdmin } = req.body;  // Extract isAdmin from the request body

        // Check if the user is an admin
        if (!isAdmin) {
            return res.status(403).json({
                status: 'Error',
                message: "Bạn không có quyền thực hiện hành động này!"
            });
        }

        const deletedCustomer = await Customer.findOneAndDelete({ phone });
        
        if (!deletedCustomer) {
            return res.status(404).json({
                status: 'Error',
                message: "Khách hàng không tồn tại!"
            });
        }

        res.status(200).json({
            status: 'Success',
            message: "Xóa thông tin khách hàng thành công"
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            status: 'Error',
            message: "Server lỗi"
        });
    }
});

app.delete('/api/deleteAllCustomers', async (req, res) => {
    try {
        const { isAdmin } = req.body;  // Extract isAdmin from request body
        if (!isAdmin) {
            return res.status(403).json({
                status: 'Error',
                message: "Bạn không có quyền thực hiện hành động này!"
            });
        }

        // Assuming `isAdmin` is a boolean field
        const result = await Customer.deleteMany({ isAdmin: { $ne: true } });

        res.status(200).json({
            status: 'Success',
            message: `Đã xóa ${result.deletedCount} khách hàng`
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            status: 'Error',
            message: "Server lỗi"
        });
    }
});

