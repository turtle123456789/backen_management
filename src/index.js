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
app.use('/uploads', express.static('uploads'));
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
app.post('/api/createCustomer',upload.single('avatar'),async (req,res)=>{
    try{
        const { name, phone, email } = req.body
        console.log('name, phone, email', name, phone, email)
        const avatar = req.file ? `/uploads/${req.file.filename}` : null;
        const checkCustomer = await Customer.findOne({
            phone: phone,
            email: email,
        })
        console.log('checkCustomer', checkCustomer)
        if(checkCustomer !== null){
            return res.status(201).json({
                status: 'Error',
                message: "Số điện thoại hoặc email đã tồn tại !"
            });
        }
        const createdUser = await Customer.create({
            name: name,
            phone: phone,
            email:email,
            avatar: avatar
        })
        res.status(201).json({
            status: 'Success',
            message: "Thêm thông tin khách hàng thành công"
        });

    }catch (err){ 
        res.status(500).json({
            status: 'Error',
            message: "server lỗi" 
        });

    }
})
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