import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
});

// userSchema.pre('save', function (next) {
//     console.log('pre save cagrildi')
//     next()
// });

const User = mongoose.model('User', userSchema);

export default User;