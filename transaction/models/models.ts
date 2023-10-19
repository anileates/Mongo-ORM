import mongoose from "mongoose";

const transferSchema = new mongoose.Schema({
  sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  amount: {
      type: Number,
      required: true
  }
});

const outgoingTransferSchema = new mongoose.Schema({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserWithTransfers",
  },
  amount: {
    type: Number,
    required: true,
  },
});

const incomingTransferSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserWithTransfers",
  },
  amount: {
    type: Number,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  outgoingTransfers: [outgoingTransferSchema],
  incomingTransfers: [incomingTransferSchema],
});

// userSchema.pre('save', function (next) {
//     console.log('pre save cagrildi')
//     next()
// });

const User = mongoose.model("User", userSchema);
const IncomingTransfer = mongoose.model('IncomingTransfer', incomingTransferSchema);
const OutgoingTransfer = mongoose.model('OutgoingTransfer', outgoingTransferSchema);
const Transfer = mongoose.model('Transfer', transferSchema);

export { User, IncomingTransfer, OutgoingTransfer, Transfer };
