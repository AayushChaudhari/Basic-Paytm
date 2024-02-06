const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://admin-Aayush:PczX6nvVNRfYw1vw@cluster0.iw2ya.mongodb.net/paytm");

const userSchema = new mongoose.Schema({
    userName: String,
    password: String,
    firstName: String,
    lastName: String
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const Account = mongoose.model('Account', accountSchema);

const User = mongoose.model('User', userSchema);

module.exports = {
	User,
    Account,
};