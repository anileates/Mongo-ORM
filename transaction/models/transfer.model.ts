import { Schema, model } from 'mongoose';

const transferSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

const Transfer = model('Transfer', transferSchema);

export default Transfer;
